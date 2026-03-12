// ─── GlobeOps Production Server ───
// Zero-dependency Node.js server for serving the built app + API proxy endpoints.
// Usage: node server.js   (or: PORT=8080 node server.js)

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DIST_DIR = join(__dirname, 'dist');
const PORT = parseInt(process.env.PORT || '3000', 10);

// ─── MIME types for static file serving ───
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'text/xml; charset=utf-8',
  '.webp': 'image/webp',
  '.map': 'application/json',
};

// ─── Security: allowed proxy domains ───
const ALLOWED_PROXY_DOMAINS = new Set([
  'eonet.gsfc.nasa.gov',
  'api.gdeltproject.org',
  'gamma-api.polymarket.com',
  'api.coingecko.com',
  'api.weather.gov',
  'api.acleddata.com',
  'api.reliefweb.int',
  'www.gdacs.org',
  'opensky-network.org',
  'earthquake.usgs.gov',
]);

// ─── Concurrency limiter (mirrors vite.config.ts) ───
function createConcurrencyLimiter(maxConcurrent) {
  let active = 0;
  const queue = [];
  let totalProcessed = 0;
  let totalTimedOut = 0;
  let totalErrors = 0;

  return {
    acquire() {
      if (active < maxConcurrent) {
        active++;
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        queue.push(() => { active++; resolve(); });
      });
    },
    release() {
      active--;
      totalProcessed++;
      if (queue.length > 0) queue.shift()();
    },
    recordTimeout() { totalTimedOut++; },
    recordError() { totalErrors++; },
    stats() {
      return { active, queued: queue.length, maxConcurrent, totalProcessed, totalTimedOut, totalErrors };
    },
  };
}

const proxyLimiter = createConcurrencyLimiter(30);
const PROXY_TIMEOUT_MS = 15_000;

// ─── In-memory response cache ───
const responseCache = new Map();
const CACHE_TTL_MS = 120_000;

function getCached(url) {
  const entry = responseCache.get(url);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    responseCache.delete(url);
    return null;
  }
  return { body: entry.body, contentType: entry.contentType };
}

function setCache(url, body, contentType) {
  responseCache.set(url, { body, contentType, timestamp: Date.now() });
  if (responseCache.size % 50 === 0) {
    const now = Date.now();
    for (const [key, val] of responseCache) {
      if (now - val.timestamp > CACHE_TTL_MS) responseCache.delete(key);
    }
  }
}

// ─── Simple string hash (djb2) for cache keys ───
function simpleHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
}

// ─── Rate limiter (per-IP, sliding window) ───
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120;

function checkRateLimit(ip) {
  const now = Date.now();
  let record = rateLimitMap.get(ip);
  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(ip, record);
  }
  // Evict old entries
  record.timestamps = record.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (record.timestamps.length >= RATE_LIMIT_MAX) return false;
  record.timestamps.push(now);
  return true;
}

// Periodic cleanup of stale rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap) {
    record.timestamps = record.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (record.timestamps.length === 0) rateLimitMap.delete(ip);
  }
}, 60_000);

// ─── AI Provider Configuration ───
const AI_PROVIDERS = {
  google: {
    envKey: 'AI_GOOGLE_KEY',
    model: 'gemini-2.0-flash',
    label: 'Gemini 2.0 Flash',
  },
  anthropic: {
    envKey: 'AI_ANTHROPIC_KEY',
    model: 'claude-sonnet-4-20250514',
    label: 'Claude Sonnet',
  },
  openai: {
    envKey: 'AI_OPENAI_KEY',
    model: 'gpt-4o-mini',
    label: 'GPT-4o Mini',
  },
};

const AI_SYSTEM_PROMPT = `You are an intelligence analyst for GlobeOps, a real-time global operations dashboard. Analyze the provided news headlines and seismic data, then return a JSON intelligence briefing.

IMPORTANT: Return ONLY valid JSON matching this exact schema — no markdown, no explanation, just the JSON object:

{
  "summary": "2-3 sentence executive summary of global situation",
  "threatLevel": "LOW" | "GUARDED" | "ELEVATED" | "HIGH" | "SEVERE",
  "keyDevelopments": [
    {
      "title": "Brief headline (max 80 chars)",
      "category": "SECURITY" | "DEFENSE" | "ECONOMIC" | "CYBER" | "SEISMIC" | "POLITICAL" | "HUMANITARIAN",
      "severity": "low" | "medium" | "high" | "critical",
      "region": "NORTH AMERICA" | "SOUTH AMERICA" | "EUROPE" | "MIDDLE EAST" | "AFRICA" | "SOUTH ASIA" | "EAST ASIA" | "OCEANIA" | "GLOBAL"
    }
  ],
  "regionAssessments": [
    {
      "region": "NORTH AMERICA" | "SOUTH AMERICA" | "EUROPE" | "MIDDLE EAST" | "AFRICA" | "SOUTH ASIA" | "EAST ASIA" | "OCEANIA",
      "threatLevel": 0-100,
      "trend": "rising" | "stable" | "declining",
      "topConcern": "Brief description of top concern"
    }
  ]
}

Rules:
- keyDevelopments: 5-12 items, ordered by severity (critical first)
- regionAssessments: all 8 regions, ordered by threatLevel (highest first)
- threatLevel scoring: SEVERE (40+), HIGH (25-39), ELEVATED (12-24), GUARDED (5-11), LOW (0-4) based on critical×10 + high×3 + major_quakes×5
- Be precise, analytical, and data-driven. No speculation beyond what the data supports.`;

const AI_TIMEOUT_MS = 30_000;

// AI-specific rate limiter (stricter: 12 requests per hour per IP)
const aiRateLimitMap = new Map();
const AI_RATE_LIMIT_WINDOW_MS = 3_600_000; // 1 hour
const AI_RATE_LIMIT_MAX = 12;

function checkAiRateLimit(ip) {
  const now = Date.now();
  let record = aiRateLimitMap.get(ip);
  if (!record) {
    record = { timestamps: [] };
    aiRateLimitMap.set(ip, record);
  }
  record.timestamps = record.timestamps.filter((t) => now - t < AI_RATE_LIMIT_WINDOW_MS);
  if (record.timestamps.length >= AI_RATE_LIMIT_MAX) return false;
  record.timestamps.push(now);
  return true;
}

// In-memory AI response cache (5-minute TTL)
const aiCache = new Map();
const AI_CACHE_TTL_MS = 300_000;

function getAiCached(key) {
  const entry = aiCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > AI_CACHE_TTL_MS) {
    aiCache.delete(key);
    return null;
  }
  return entry.body;
}

function setAiCache(key, body) {
  aiCache.set(key, { body, timestamp: Date.now() });
  // Evict stale entries
  if (aiCache.size > 20) {
    const now = Date.now();
    for (const [k, v] of aiCache) {
      if (now - v.timestamp > AI_CACHE_TTL_MS) aiCache.delete(k);
    }
  }
}

// ─── AI Provider API Callers ───

async function callGoogle(apiKey, userPrompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: AI_SYSTEM_PROMPT }] },
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: 2048,
        },
      }),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    }
  );
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Google API ${response.status}: ${err.slice(0, 200)}`);
  }
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Google API returned empty response');
  return JSON.parse(text);
}

async function callAnthropic(apiKey, userPrompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: AI_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
    signal: AbortSignal.timeout(AI_TIMEOUT_MS),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API ${response.status}: ${err.slice(0, 200)}`);
  }
  const data = await response.json();
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error('Anthropic API returned empty response');
  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
  return JSON.parse(cleaned);
}

async function callOpenAI(apiKey, userPrompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2048,
    }),
    signal: AbortSignal.timeout(AI_TIMEOUT_MS),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API ${response.status}: ${err.slice(0, 200)}`);
  }
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI API returned empty response');
  return JSON.parse(text);
}

const AI_CALLERS = { google: callGoogle, anthropic: callAnthropic, openai: callOpenAI };

// ─── Read JSON request body ───
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString()));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

// ─── AI briefing handler ───
async function handleAiBriefing(req, res) {
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;

  // General + AI-specific rate limits
  if (!checkRateLimit(clientIp)) {
    res.statusCode = 429;
    res.end(JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }));
    return;
  }
  if (!checkAiRateLimit(clientIp)) {
    res.statusCode = 429;
    res.end(JSON.stringify({ error: 'AI rate limit exceeded (12/hr). Try again later.' }));
    return;
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Invalid JSON body' }));
    return;
  }

  const { provider, feeds, quakes } = body;

  if (!provider || !AI_PROVIDERS[provider]) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Invalid provider. Use: google, anthropic, openai' }));
    return;
  }

  const config = AI_PROVIDERS[provider];
  const apiKey = process.env[config.envKey];

  if (!apiKey) {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: `No API key configured for ${provider}. Set ${config.envKey} env var.` }));
    return;
  }

  // Check cache (keyed by provider + data hash)
  const cacheKey = `${provider}:${simpleHash(JSON.stringify(feeds || []))}:${simpleHash(JSON.stringify(quakes || []))}:${Math.floor(Date.now() / AI_CACHE_TTL_MS)}`;
  const cached = getAiCached(cacheKey);
  if (cached) {
    setSecurityHeaders(res);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-AI-Cache', 'HIT');
    res.statusCode = 200;
    res.end(JSON.stringify(cached));
    return;
  }

  // Build user prompt from feed/quake data
  const feedLines = (feeds || [])
    .slice(0, 40)
    .map((f) => `- [${f.category || 'news'}] ${f.title} (${f.source || 'unknown'})`)
    .join('\n');

  const quakeLines = (quakes || [])
    .slice(0, 10)
    .map((q) => `- M${q.magnitude} ${q.place}`)
    .join('\n');

  const userPrompt = [
    `Analyze the following intelligence data and generate a briefing.`,
    `\n## Recent Headlines (${(feeds || []).length} total, showing top ${Math.min((feeds || []).length, 40)}):`,
    feedLines || '(No recent headlines)',
    `\n## Seismic Activity (${(quakes || []).length} events):`,
    quakeLines || '(No significant seismic activity)',
    `\nGenerate the intelligence briefing JSON now.`,
  ].join('\n');

  try {
    const caller = AI_CALLERS[provider];
    const result = await caller(apiKey, userPrompt);

    // Validate and normalize the response
    const briefing = {
      summary: result.summary || 'Analysis complete.',
      threatLevel: ['LOW', 'GUARDED', 'ELEVATED', 'HIGH', 'SEVERE'].includes(result.threatLevel) ? result.threatLevel : 'LOW',
      keyDevelopments: Array.isArray(result.keyDevelopments) ? result.keyDevelopments.slice(0, 12) : [],
      regionAssessments: Array.isArray(result.regionAssessments) ? result.regionAssessments.slice(0, 8) : [],
      source: `${provider}-api`,
      timestamp: new Date().toISOString(),
    };

    setAiCache(cacheKey, briefing);

    setSecurityHeaders(res);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-AI-Cache', 'MISS');
    res.setHeader('X-AI-Provider', provider);
    res.statusCode = 200;
    res.end(JSON.stringify(briefing));
  } catch (err) {
    console.error(`[AI] ${provider} error:`, err.message || err);
    res.statusCode = 503;
    res.end(JSON.stringify({
      error: 'AI analysis temporarily unavailable. Try again shortly.',
    }));
  }
}

// ─── AI status handler ───
function handleAiStatus(_req, res) {
  const providers = {};
  for (const [name, config] of Object.entries(AI_PROVIDERS)) {
    providers[name] = !!process.env[config.envKey];
  }
  providers.computed = true; // Always available

  setSecurityHeaders(res);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');
  res.statusCode = 200;
  res.end(JSON.stringify({ providers }));
}

// ─── Security headers ───
function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
}

// ─── URL validation ───
function isValidUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

function isAllowedProxyDomain(urlStr) {
  try {
    const u = new URL(urlStr);
    return ALLOWED_PROXY_DOMAINS.has(u.hostname);
  } catch {
    return false;
  }
}

// ─── Proxy handler (shared by /api/rss and /api/proxy) ───
async function handleProxy(req, res, { paramName, acceptHeader, userAgent, validateDomain }) {
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
  if (!checkRateLimit(clientIp)) {
    res.statusCode = 429;
    res.end(JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }));
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const targetUrl = url.searchParams.get(paramName);

  if (!targetUrl) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: `Missing ${paramName} parameter` }));
    return;
  }

  if (!isValidUrl(targetUrl)) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Invalid URL' }));
    return;
  }

  if (validateDomain && !isAllowedProxyDomain(targetUrl)) {
    res.statusCode = 403;
    res.end(JSON.stringify({ error: 'Domain not in allowlist' }));
    return;
  }

  // Check cache
  const cached = getCached(targetUrl);
  if (cached) {
    setSecurityHeaders(res);
    res.setHeader('Content-Type', cached.contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=120');
    res.setHeader('X-Cache', 'HIT');
    res.statusCode = 200;
    res.end(cached.body);
    return;
  }

  await proxyLimiter.acquire();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': userAgent, Accept: acceptHeader },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const contentType = response.headers.get('content-type') || 'text/plain';
    const body = await response.text();

    if (response.ok) setCache(targetUrl, body, contentType);

    setSecurityHeaders(res);
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
      error: isTimeout ? 'Upstream request timed out' : 'Failed to fetch upstream',
      detail: String(err),
    }));
  } finally {
    proxyLimiter.release();
  }
}

// ─── Static file serving ───
async function serveStatic(res, filePath) {
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) return false;

    const ext = extname(filePath);
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    const content = await readFile(filePath);

    setSecurityHeaders(res);
    res.setHeader('Content-Type', mime);

    // Hashed assets get long cache, index.html gets no-cache
    if (filePath.includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }

    res.statusCode = 200;
    res.end(content);
    return true;
  } catch {
    return false;
  }
}

// ─── SPA fallback ───
async function serveIndex(res) {
  try {
    const content = await readFile(join(DIST_DIR, 'index.html'));
    setSecurityHeaders(res);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.statusCode = 200;
    res.end(content);
  } catch {
    res.statusCode = 500;
    res.end('Server error: index.html not found. Run "npm run build" first.');
  }
}

// ─── HTTP server ───
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 204;
    res.end();
    return;
  }

  // API: RSS proxy
  if (pathname === '/api/rss') {
    await handleProxy(req, res, {
      paramName: 'url',
      acceptHeader: 'application/rss+xml, application/xml, text/xml, */*',
      userAgent: 'GlobeOps/1.0.0 RSS Reader',
      validateDomain: false, // RSS feeds come from many domains
    });
    return;
  }

  // API: JSON proxy (domain-restricted)
  if (pathname === '/api/proxy') {
    await handleProxy(req, res, {
      paramName: 'url',
      acceptHeader: 'application/json, application/geo+json, */*',
      userAgent: 'GlobeOps/1.0.0',
      validateDomain: true,
    });
    return;
  }

  // API: AI briefing (POST only)
  if (pathname === '/api/ai' && req.method === 'POST') {
    await handleAiBriefing(req, res);
    return;
  }

  // API: AI provider status
  if (pathname === '/api/ai/status') {
    handleAiStatus(req, res);
    return;
  }

  // API: Proxy diagnostics
  if (pathname === '/api/proxy-stats') {
    const stats = proxyLimiter.stats();
    const cacheSize = responseCache.size;
    const now = Date.now();
    let validEntries = 0;
    for (const [, val] of responseCache) {
      if (now - val.timestamp <= CACHE_TTL_MS) validEntries++;
    }
    setSecurityHeaders(res);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify({
      proxy: stats,
      cache: { entries: cacheSize, validEntries, ttlMs: CACHE_TTL_MS },
      config: { timeoutMs: PROXY_TIMEOUT_MS, maxConcurrent: 30 },
    }, null, 2));
    return;
  }

  // ─── Health check ───
  if (pathname === '/health') {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
    return;
  }

  // Static files from dist/
  if (pathname !== '/' && !pathname.startsWith('/api/')) {
    const filePath = join(DIST_DIR, pathname);
    // Prevent directory traversal
    if (!filePath.startsWith(DIST_DIR)) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }
    const served = await serveStatic(res, filePath);
    if (served) return;
  }

  // SPA fallback — serve index.html for all other routes
  await serveIndex(res);
});

// ─── AI rate limit cleanup ───
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of aiRateLimitMap) {
    record.timestamps = record.timestamps.filter((t) => now - t < AI_RATE_LIMIT_WINDOW_MS);
    if (record.timestamps.length === 0) aiRateLimitMap.delete(ip);
  }
}, 300_000);

server.listen(PORT, () => {
  const aiProviders = Object.entries(AI_PROVIDERS)
    .filter(([, cfg]) => !!process.env[cfg.envKey])
    .map(([name]) => name);
  const aiStatus = aiProviders.length > 0 ? aiProviders.join(', ') : 'none (computed only)';

  console.log(`\n  ┌─────────────────────────────────────┐`);
  console.log(`  │  GlobeOps Production Server v1.0.0  │`);
  console.log(`  ├─────────────────────────────────────┤`);
  console.log(`  │  Local:  http://localhost:${PORT}       │`);
  console.log(`  │  Proxy:  /api/rss, /api/proxy       │`);
  console.log(`  │  AI:     /api/ai, /api/ai/status     │`);
  console.log(`  │  Stats:  /api/proxy-stats            │`);
  console.log(`  ├─────────────────────────────────────┤`);
  console.log(`  │  AI Keys: ${aiStatus.padEnd(25)}│`);
  console.log(`  └─────────────────────────────────────┘\n`);
});
