import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// ─── Concurrency limiter for outbound proxy requests ───
// Prevents flooding: 97 feeds × 2 retries can overwhelm a single-threaded proxy.
// Max 6 concurrent outbound requests; the rest queue and wait.
function createConcurrencyLimiter(maxConcurrent: number) {
  let active = 0;
  const queue: Array<() => void> = [];
  let totalProcessed = 0;
  let totalTimedOut = 0;
  let totalErrors = 0;

  return {
    async acquire(): Promise<void> {
      if (active < maxConcurrent) {
        active++;
        return;
      }
      return new Promise<void>((resolve) => {
        queue.push(() => {
          active++;
          resolve();
        });
      });
    },
    release() {
      active--;
      totalProcessed++;
      if (queue.length > 0) {
        const next = queue.shift()!;
        next();
      }
    },
    recordTimeout() { totalTimedOut++; },
    recordError() { totalErrors++; },
    stats() {
      return { active, queued: queue.length, maxConcurrent, totalProcessed, totalTimedOut, totalErrors };
    },
  };
}

// Shared limiter across both proxy endpoints
// 30 concurrent allows 100+ feeds to process in ~4 batches instead of ~7
const proxyLimiter = createConcurrencyLimiter(30);

// Request timeout (ms) — abort outbound fetches that hang
// 15s gives slow feeds (gov sites, intl sources) time to respond
const PROXY_TIMEOUT_MS = 15_000;

// ─── In-memory response cache ───
// Short-lived cache (2 min) so duplicate requests from multiple panels
// don't each generate an outbound fetch.
const responseCache = new Map<string, { body: string; contentType: string; timestamp: number }>();
const CACHE_TTL_MS = 120_000; // 2 minutes

function getCached(url: string): { body: string; contentType: string } | null {
  const entry = responseCache.get(url);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    responseCache.delete(url);
    return null;
  }
  return { body: entry.body, contentType: entry.contentType };
}

function setCache(url: string, body: string, contentType: string) {
  responseCache.set(url, { body, contentType, timestamp: Date.now() });
  // Evict stale entries periodically (every 50 writes)
  if (responseCache.size % 50 === 0) {
    const now = Date.now();
    for (const [key, val] of responseCache) {
      if (now - val.timestamp > CACHE_TTL_MS) responseCache.delete(key);
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'rss-proxy',
      configureServer(server) {
        server.middlewares.use('/api/rss', async (req, res) => {
          const url = new URL(req.url!, `http://${req.headers.host}`);
          const feedUrl = url.searchParams.get('url');

          if (!feedUrl) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing url parameter' }));
            return;
          }

          // Check in-memory cache first
          const cached = getCached(feedUrl);
          if (cached) {
            res.setHeader('Content-Type', cached.contentType);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'public, max-age=120');
            res.setHeader('X-Cache', 'HIT');
            res.statusCode = 200;
            res.end(cached.body);
            return;
          }

          // Acquire concurrency slot (queues if > 6 active)
          await proxyLimiter.acquire();

          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

            const response = await fetch(feedUrl, {
              headers: {
                'User-Agent': 'GlobeOps/1.0.0 RSS Reader',
                Accept: 'application/rss+xml, application/xml, text/xml, */*',
              },
              signal: controller.signal,
            });

            clearTimeout(timeout);

            const contentType = response.headers.get('content-type') || 'text/xml';
            const body = await response.text();

            // Cache successful responses
            if (response.ok) {
              setCache(feedUrl, body, contentType);
            }

            res.setHeader('Content-Type', contentType);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'public, max-age=120');
            res.setHeader('X-Cache', 'MISS');
            res.statusCode = response.status;
            res.end(body);
          } catch (err) {
            const isTimeout = err instanceof Error && err.name === 'AbortError';
            if (isTimeout) proxyLimiter.recordTimeout();
            else proxyLimiter.recordError();
            res.statusCode = isTimeout ? 504 : 502;
            res.end(JSON.stringify({
              error: isTimeout ? 'Feed fetch timed out' : 'Failed to fetch feed',
              detail: String(err),
            }));
          } finally {
            proxyLimiter.release();
          }
        });

        // ─── JSON API proxy (CORS bypass for external APIs) ───
        server.middlewares.use('/api/proxy', async (req, res) => {
          const url = new URL(req.url!, `http://${req.headers.host}`);
          const targetUrl = url.searchParams.get('url');

          if (!targetUrl) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing url parameter' }));
            return;
          }

          await proxyLimiter.acquire();

          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

            const response = await fetch(targetUrl, {
              headers: {
                'User-Agent': 'GlobeOps/1.0.0',
                Accept: 'application/json, application/geo+json, */*',
              },
              signal: controller.signal,
            });

            clearTimeout(timeout);

            const contentType = response.headers.get('content-type') || 'application/json';
            const body = await response.text();

            res.setHeader('Content-Type', contentType);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'public, max-age=60');
            res.statusCode = response.status;
            res.end(body);
          } catch (err) {
            const isTimeout = err instanceof Error && err.name === 'AbortError';
            if (isTimeout) proxyLimiter.recordTimeout();
            else proxyLimiter.recordError();
            res.statusCode = isTimeout ? 504 : 502;
            res.end(JSON.stringify({
              error: isTimeout ? 'API fetch timed out' : 'Failed to fetch API',
              detail: String(err),
            }));
          } finally {
            proxyLimiter.release();
          }
        });

        // ─── AI Briefing endpoint (POST /api/ai) ───
        server.middlewares.use('/api/ai', async (req, res, next) => {
          if (req.method !== 'POST') { next(); return; }

          const AI_SYS = `You are an intelligence analyst for GlobeOps. Analyze the provided news headlines and seismic data, then return a JSON intelligence briefing. Return ONLY valid JSON matching this schema:
{"summary":"string","threatLevel":"LOW"|"GUARDED"|"ELEVATED"|"HIGH"|"SEVERE","keyDevelopments":[{"title":"string","category":"SECURITY"|"DEFENSE"|"ECONOMIC"|"CYBER"|"SEISMIC"|"POLITICAL"|"HUMANITARIAN","severity":"low"|"medium"|"high"|"critical","region":"NORTH AMERICA"|"SOUTH AMERICA"|"EUROPE"|"MIDDLE EAST"|"AFRICA"|"SOUTH ASIA"|"EAST ASIA"|"OCEANIA"|"GLOBAL"}],"regionAssessments":[{"region":"string","threatLevel":0-100,"trend":"rising"|"stable"|"declining","topConcern":"string"}]}
Rules: keyDevelopments 5-12 items sorted by severity. regionAssessments all 8 regions sorted by threatLevel. Be precise and data-driven.`;

          let body: { provider?: string; feeds?: Array<{ title: string; source: string; category: string }>; quakes?: Array<{ magnitude: number; place: string }> };
          try {
            const chunks: Buffer[] = [];
            for await (const chunk of req) chunks.push(chunk as Buffer);
            body = JSON.parse(Buffer.concat(chunks).toString());
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid JSON body' }));
            return;
          }

          const { provider, feeds, quakes } = body;
          const keyMap: Record<string, string> = { google: 'AI_GOOGLE_KEY', anthropic: 'AI_ANTHROPIC_KEY', openai: 'AI_OPENAI_KEY' };
          if (!provider || !keyMap[provider]) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid provider' }));
            return;
          }
          const apiKey = process.env[keyMap[provider]];
          if (!apiKey) {
            res.statusCode = 503;
            res.end(JSON.stringify({ error: `No API key for ${provider}. Set ${keyMap[provider]}.` }));
            return;
          }

          const feedLines = (feeds || []).slice(0, 40).map((f) => `- [${f.category}] ${f.title} (${f.source})`).join('\n');
          const quakeLines = (quakes || []).slice(0, 10).map((q) => `- M${q.magnitude} ${q.place}`).join('\n');
          const userPrompt = `Analyze:\n## Headlines (${(feeds || []).length}):\n${feedLines || '(none)'}\n## Quakes (${(quakes || []).length}):\n${quakeLines || '(none)'}\nGenerate briefing JSON.`;

          try {
            let result: Record<string, unknown>;
            if (provider === 'google') {
              const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: userPrompt }] }], systemInstruction: { parts: [{ text: AI_SYS }] }, generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 2048 } }),
                signal: AbortSignal.timeout(30_000),
              });
              if (!resp.ok) throw new Error(`Google ${resp.status}`);
              const d = await resp.json();
              result = JSON.parse(d?.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
            } else if (provider === 'anthropic') {
              const resp = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
                body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 2048, system: AI_SYS, messages: [{ role: 'user', content: userPrompt }] }),
                signal: AbortSignal.timeout(30_000),
              });
              if (!resp.ok) throw new Error(`Anthropic ${resp.status}`);
              const d = await resp.json();
              const txt = (d?.content?.[0]?.text || '').replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
              result = JSON.parse(txt);
            } else {
              const resp = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: AI_SYS }, { role: 'user', content: userPrompt }], response_format: { type: 'json_object' }, max_tokens: 2048 }),
                signal: AbortSignal.timeout(30_000),
              });
              if (!resp.ok) throw new Error(`OpenAI ${resp.status}`);
              const d = await resp.json();
              result = JSON.parse(d?.choices?.[0]?.message?.content || '{}');
            }

            const briefing = {
              summary: (result as { summary?: string }).summary || 'Analysis complete.',
              threatLevel: ['LOW', 'GUARDED', 'ELEVATED', 'HIGH', 'SEVERE'].includes(String((result as { threatLevel?: string }).threatLevel)) ? (result as { threatLevel: string }).threatLevel : 'LOW',
              keyDevelopments: Array.isArray((result as { keyDevelopments?: unknown[] }).keyDevelopments) ? (result as { keyDevelopments: unknown[] }).keyDevelopments.slice(0, 12) : [],
              regionAssessments: Array.isArray((result as { regionAssessments?: unknown[] }).regionAssessments) ? (result as { regionAssessments: unknown[] }).regionAssessments.slice(0, 8) : [],
              source: `${provider}-api`,
              timestamp: new Date().toISOString(),
            };
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.statusCode = 200;
            res.end(JSON.stringify(briefing));
          } catch (err) {
            console.error(`[AI Dev] ${provider} error:`, err);
            res.statusCode = 503;
            res.end(JSON.stringify({ error: `AI error (${provider})`, detail: String(err) }));
          }
        });

        // ─── AI Provider status ───
        server.middlewares.use('/api/ai/status', (_req, res) => {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({
            providers: {
              google: !!process.env.AI_GOOGLE_KEY,
              anthropic: !!process.env.AI_ANTHROPIC_KEY,
              openai: !!process.env.AI_OPENAI_KEY,
              computed: true,
            },
          }));
        });

        // ─── Diagnostic endpoint — proxy health & cache stats ───
        server.middlewares.use('/api/proxy-stats', (_req, res) => {
          const stats = proxyLimiter.stats();
          const cacheSize = responseCache.size;
          const now = Date.now();
          let cacheHits = 0;
          for (const [, val] of responseCache) {
            if (now - val.timestamp <= CACHE_TTL_MS) cacheHits++;
          }
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({
            proxy: stats,
            cache: { entries: cacheSize, validEntries: cacheHits, ttlMs: CACHE_TTL_MS },
            config: { timeoutMs: PROXY_TIMEOUT_MS, maxConcurrent: 30 },
          }, null, 2));
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
