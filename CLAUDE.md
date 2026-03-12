# GlobeOps — Agent Guide

Brief, accurate context for AI agents working on GlobeOps.

## Current Shape

- **What:** Real-time global intelligence operations dashboard — CLI-styled terminal UI with ASCII world map
- **Stack:** React 19 + TypeScript 5.9 + Vite 7.3 + Tailwind CSS 4, Zustand 5, TanStack React Query 5, react-grid-layout
- **Size:** ~20.7K LOC across 122 TypeScript files
- **Data:** 97 RSS feeds (25 categories) + 7 live API integrations
- **AI:** Multi-provider briefing (Google Gemini / Anthropic Claude / OpenAI GPT + computed keyword fallback)
- **Server:** Zero-dependency vanilla Node.js production server (API proxy + static serving)
- **Version:** 1.0.1
- **Key constraint:** AI API keys are server-side only; client POSTs data summaries to `/api/ai/*`

## Key Files

| File | Purpose |
|------|---------|
| **Server** | |
| `server.js` | Production server (24.5KB) — static serving, API proxy (allowlisted domains), AI proxy, rate limiting, caching |
| `vite.config.ts` | Dev server with proxy middleware (25.5KB) — mirrors prod proxy, concurrency limiter |
| **Config** | |
| `src/config/feed-sources.ts` | 97 RSS feed definitions across 25 categories |
| `src/config/data-sources.ts` | API endpoint configuration |
| `src/config/constants.ts` | Panel IDs, refresh intervals, grid config |
| `src/config/layout-presets.ts` | 8 dashboard layout presets |
| `src/config/event-types.ts` | Map layer event type registry |
| `src/config/strategic-markers.ts` | Static infrastructure markers (military, nuclear, pipelines, etc.) |
| **State & Types** | |
| `src/store/app-store.ts` | Zustand global state (theme, layout, panel toggles, map filters, AI provider) |
| `src/types/index.ts` | All TypeScript interfaces (Feed, Event, Region, MapEvent, MapLayer, DataSource) |
| **Services (14)** | |
| `src/services/ai-service.ts` | Multi-provider AI briefing (Gemini/Claude/OpenAI + computed fallback) |
| `src/services/rss-service.ts` | RSS feed fetching + XML parsing |
| `src/services/feed-aggregator.ts` | Cross-feed aggregation + deduplication |
| `src/services/event-normalizer.ts` | Unified event schema normalization |
| `src/services/earthquake-service.ts` | USGS earthquake API client |
| `src/services/eonet-service.ts` | NASA EONET natural events |
| `src/services/gdelt-service.ts` | GDELT geopolitical event database |
| `src/services/gdacs-service.ts` | Global disaster alert coordination |
| `src/services/reliefweb-service.ts` | ReliefWeb humanitarian data |
| `src/services/noaa-service.ts` | NOAA weather alerts |
| `src/services/coingecko-service.ts` | Cryptocurrency market data |
| `src/services/polymarket-service.ts` | Prediction market data |
| `src/services/acled-service.ts` | Armed conflict event data |
| `src/services/telegram-service.ts` | Telegram feed parsing |
| **Hooks (16)** | |
| `src/hooks/useRssFeed.ts` | Staggered RSS fetching (priority-based delays) |
| `src/hooks/useEarthquakes.ts` | USGS polling (5 min) |
| `src/hooks/useNaturalEvents.ts` | NASA EONET polling (15 min) |
| `src/hooks/useGdelt.ts` | GDELT polling (15 min) |
| `src/hooks/useWeather.ts` | NOAA polling (15 min) |
| `src/hooks/useCrypto.ts` | CoinGecko polling (60 sec) |
| `src/hooks/usePredictionMarkets.ts` | Polymarket polling (5 min) |
| `src/hooks/useACLED.ts` | Armed conflict polling (10 min) |
| `src/hooks/useReliefWeb.ts` | Disaster tracking (10 min) |
| `src/hooks/useGDACS.ts` | Disaster alerts (5 min) |
| `src/hooks/useClock.ts` | World clock tick (1 sec) |
| `src/hooks/useAiBriefing.ts` | AI intelligence generation |
| `src/hooks/useAiProviders.ts` | Provider status checking |
| `src/hooks/usePulse.ts` | Global RSS refresh driver (invalidates every 15s) |
| `src/hooks/useTypewriter.ts` | Terminal text animation |
| **Components** | |
| `src/components/layout/Dashboard.tsx` | Main dashboard grid (react-grid-layout) |
| `src/components/layout/Header.tsx` | App header with theme/layout controls |
| `src/components/panels/` | 24 data panels (WorldMap, LiveFeed, ThreatBoard, MarketTerminal, etc.) |
| `src/components/panels/world-map/` | ASCII world map subsystem (15+ subcomponents) |
| `src/components/terminal/` | Terminal UI primitives (CRT overlay, command line, ASCII charts) |

## Local Workflow

```bash
npm install
npm run dev          # Vite dev server with API proxy (port 5173)
npm run build        # TypeScript check + Vite production build
npm run preview      # Preview production build
npm start            # Production server (port 3000, requires dist/)
```

- Dev proxy in `vite.config.ts` handles CORS for all external APIs
- Production `server.js` serves static `dist/` + proxies API requests
- Both servers have concurrency limiters (30 max outbound) and response caching
- MIE workspace launch config uses port 4040 (`npm run dev -- --port 4040`)

## Environment Variables

```env
AI_GOOGLE_KEY=          # Google Gemini 2.0 Flash (recommended)
AI_ANTHROPIC_KEY=       # Anthropic Claude Sonnet (alternative)
AI_OPENAI_KEY=          # OpenAI GPT-4o Mini (alternative)
VITE_ACLED_API_KEY=     # Armed conflict data (optional)
```

All optional — dashboard degrades gracefully. AI panels fall back to computed keyword analysis (no key needed).

## Data Sources

**7 APIs** (all proxied through server, never called directly from browser):
- USGS Earthquakes (5 min) — seismic events with magnitude, depth, location
- NASA EONET (15 min) — wildfires, storms, volcanoes, floods
- GDELT (15 min) — global news event analysis
- NOAA Weather (15 min) — weather conditions + alerts
- CoinGecko (60 sec) — cryptocurrency prices
- Polymarket (5 min) — prediction market probabilities
- OpenSky Network (30 sec) — live aircraft tracking

**97 RSS feeds** across 25 categories: world news, US news, defense, government, think tanks, finance, tech, science, energy, humanitarian, cybersecurity, climate, disasters, commodities, regional

## Safety / Quality Rails

- No API keys in client code — AI providers use server-side keys via `/api/ai/*` proxy
- Proxy allowlist in `server.js` (`ALLOWED_PROXY_DOMAINS`) — only whitelisted domains
- No tests exist — validate with `npm run build` (tsc + vite) before shipping
- Preserve Tailwind CSS 4 pipeline (`@tailwindcss/vite` plugin, `@import "tailwindcss"`)
- CRT/terminal aesthetic is core identity — preserve scan lines, glow effects, monospace fonts
- react-grid-layout controls panel positioning — respect layout presets in `src/config/layout-presets.ts`
- Feed sources are config-driven (`src/config/feed-sources.ts`) — add/remove feeds there, not in hooks
- Rate limiting: 120 req/min/IP general, 12 req/hr/IP for AI endpoints
- In-memory cache: 2 min TTL for RSS/proxy, 5 min for AI responses

## Architecture

```
Browser (React SPA)
  |
  +-- Zustand store (app-store.ts) — theme, layout, panel toggles, map state
  |
  +-- TanStack React Query — data fetching + caching + background refetch
  |     +-- usePulse() driver → invalidates RSS queries every 15s
  |     +-- 16 data hooks → 14 services → 7 APIs + 97 RSS feeds
  |
  +-- react-grid-layout → 24 data panels (draggable, 8 layout presets)
  |     +-- Core (7): LiveFeed, WorldStatus, RegionMonitor, MarketTerminal, ThreatBoard, SystemStatus, WorldMap
  |     +-- Intelligence (7): AiAnalytics, IntelFeed, ConflictTracker, CiiIndex, PredictionMarkets, WeatherMonitor, EmergencyAlerts
  |     +-- Markets (6): EnergyAnalytics, EconomicIndicators, SupplyChain, CryptoMonitor, WorldClock, DisplacementTracker
  |     +-- Specialized (4): AiStrategicPosture, TelegramFeed, LiveNews, TransportationIntel
  |
  +-- ASCII world map subsystem (15+ components)
  |     Event overlays, heatmaps, density glyphs, day/night terminator, infrastructure layers
  |
  +-- Terminal UI system (CRT overlay, ASCII charts, command line)

Server (server.js / vite middleware)
  |
  +-- Static file serving (dist/)
  +-- API proxy (domain allowlist, concurrency limiter, response cache)
  +-- AI proxy (routes to Gemini/Claude/OpenAI, server-side key injection)
```

## Useful Notes

- 5 color themes: Green, Amber, Cyan, Red, White
- 8 layout presets: ops-center, focused, compact, intelligence, situational, markets, analyst, full-spectrum
- Zustand state persisted to localStorage (except map filter state, which resets on load)
- RSS feeds stagger initial load: high-priority immediate, medium 2s delay, low 5s delay
- Production server is zero-dependency (vanilla Node.js, no Express/Fastify)
- Project doc: `GLOBEOPS-PROJECT.md` for full component inventory and future roadmap
