# GlobeOps — Project Specification

## Product Vision

Real-time global intelligence operations dashboard. CLI-styled terminal aesthetic with an ASCII world map as the centerpiece. Designed for situational awareness monitoring — aggregates geopolitical events, natural disasters, conflicts, markets, and economic indicators into a single interface.

## Current State

- **Version:** 1.0.1 (production-ready)
- **Repository:** https://github.com/Kahooty/GlobeOps.git
- **Stack:** React 19 + TypeScript 5.9 + Vite 7.3 + Tailwind CSS 4 + Zustand 5 + TanStack React Query 5
- **Size:** ~20.7K LOC, 122 TypeScript files
- **Commits:** 4 (public repo)

## Architecture

```
                         +-------------------+
                         |   Browser (SPA)   |
                         +-------------------+
                                  |
              +-------------------+-------------------+
              |                   |                   |
        +-----------+     +-----------+     +------------------+
        |  Zustand  |     | React     |     | react-grid-      |
        |  Store    |     | Query     |     | layout           |
        +-----------+     +-----------+     +------------------+
              |                   |                   |
              |           +------+------+       24 data panels
              |           |             |       (draggable grid)
              |     +----------+  +----------+
              |     | 16 hooks |  | 14 srvcs |
              |     +----------+  +----------+
              |           |             |
              |     +-----+-------------+-----+
              |     |                         |
         +--------+ |   +-----------+    +---------+
         | app-   | |   | API Proxy |    | RSS     |
         | store  | |   | (server)  |    | Proxy   |
         +--------+ |   +-----------+    +---------+
                     |         |               |
               +-----+---------+---------------+
               |     7 APIs    |   97 RSS feeds
               +---------------+---------------+
```

**Data flow:** Source API/RSS → Server proxy (cache + rate limit) → Service module (parse + normalize) → React Query hook (poll + cache) → Panel component (render)

## Component Inventory

### Panels (24)

| Phase | Panel | Data Source |
|-------|-------|-------------|
| Core | WorldMap | All event sources (layered overlays) |
| Core | LiveFeed | RSS feeds (all categories) |
| Core | WorldStatus | Aggregated threat assessment |
| Core | RegionMonitor | RSS feeds (region-filtered) |
| Core | MarketTerminal | CoinGecko |
| Core | ThreatBoard | RSS feeds (security-filtered) |
| Core | SystemStatus | Internal health checks |
| Phase 5 | AiAnalytics | AI briefing (multi-provider) |
| Phase 5 | IntelFeed | RSS feeds (intel-filtered) |
| Phase 5 | ConflictTracker | ACLED |
| Phase 5 | CiiIndex | Computed from multiple sources |
| Phase 5 | PredictionMarkets | Polymarket |
| Phase 5 | WeatherMonitor | NOAA + NASA EONET |
| Phase 5 | EmergencyAlerts | ReliefWeb + GDACS |
| Phase 6 | EnergyAnalytics | RSS feeds (energy-filtered) |
| Phase 6 | EconomicIndicators | RSS feeds (finance-filtered) |
| Phase 6 | SupplyChain | RSS feeds (logistics-filtered) |
| Phase 6 | CryptoMonitor | CoinGecko |
| Phase 6 | WorldClock | System time (1s tick) |
| Phase 6 | DisplacementTracker | ReliefWeb |
| Phase 8 | AiStrategicPosture | AI briefing (region analysis) |
| Phase 8 | TelegramFeed | Telegram RSS proxy |
| Phase 8 | LiveNews | RSS feeds (breaking-filtered) |
| Phase 8 | TransportationIntel | OpenSky Network |

### Services (14)

| Service | Source | Refresh |
|---------|--------|---------|
| ai-service | Gemini / Claude / OpenAI / Computed | On demand |
| rss-service | 97 RSS feeds | 15s (pulse invalidation) |
| feed-aggregator | Cross-feed aggregation | On RSS update |
| event-normalizer | All event sources | On source update |
| earthquake-service | USGS | 5 min |
| eonet-service | NASA EONET | 15 min |
| gdelt-service | GDELT | 15 min |
| gdacs-service | GDACS | 5 min |
| reliefweb-service | ReliefWeb | 10 min |
| noaa-service | NOAA | 15 min |
| coingecko-service | CoinGecko | 60 sec |
| polymarket-service | Polymarket | 5 min |
| acled-service | ACLED | 10 min |
| telegram-service | Telegram | On demand |

### Config Modules (10)

| Module | Purpose |
|--------|---------|
| constants.ts | Panel IDs, refresh intervals, grid dimensions |
| feed-sources.ts | 97 RSS feed URLs + categories + priority levels |
| feed-modes.ts | Feed focus mode filter definitions |
| data-sources.ts | API endpoint URLs |
| event-types.ts | Map event type registry |
| strategic-markers.ts | Static infrastructure markers (military, nuclear, etc.) |
| regions.ts | 8 geopolitical region definitions |
| city-data.ts | City coordinates for world map |
| map-presets.ts | Map filter preset configurations |
| layout-presets.ts | 8 dashboard layout presets |

### World Map Subsystem (~15 components)

ASCII-rendered globe with multiple overlay layers:
- Base ASCII projection with configurable zoom/pan
- Event overlays (danger flags, pulse markers, activity clusters)
- Density heatmap (event concentration visualization)
- Static infrastructure layer (military bases, nuclear sites, pipelines, data centers)
- Polyline routes (maritime, aviation, trade corridors)
- Country boundary layers
- Day/night terminator with ambient glow effects
- Event detail drill-down panel

### Terminal UI System (~8 components)

- CRT scan-line overlay with phosphor glow
- Monospace text rendering with typewriter animation
- ASCII chart components (bar, line, sparkline)
- Command line input component
- Status bar / ticker components

## AI Briefing System

Multi-provider architecture with graceful degradation:

1. **Google Gemini 2.0 Flash** (recommended, `AI_GOOGLE_KEY`) — fastest, cheapest
2. **Anthropic Claude Sonnet** (alternative, `AI_ANTHROPIC_KEY`)
3. **OpenAI GPT-4o Mini** (alternative, `AI_OPENAI_KEY`)
4. **Computed fallback** (no key needed) — regex-based keyword analysis of feed data

Server-side routing: client POSTs aggregated feed data to `/api/ai/{provider}`, server injects API key and forwards. Keys never reach the browser.

## RSS Feed Categories (97 feeds)

| Category | Count | Sources |
|----------|-------|---------|
| World News | ~8 | BBC, Guardian, Al Jazeera, Reuters, AP, etc. |
| US News | ~6 | Politico, The Hill, CNN, NY Times, Wash Post |
| Defense | ~6 | Defense One, Breaking Defense, Defence Blog |
| Government | ~5 | White House, State Dept, Pentagon, UN |
| Think Tanks | ~8 | CFR, Brookings, RAND, CSIS, Carnegie |
| Finance | ~8 | CNBC, MarketWatch, FT, Bloomberg, WSJ |
| Tech | ~6 | TechCrunch, Ars Technica, Hacker News, Wired |
| Science | ~3 | NASA, Nature, Phys.org |
| Energy | ~5 | EIA, OilPrice, Energy Voice, Rigzone |
| Humanitarian | ~4 | ReliefWeb, UNHCR, ICRC, MSF |
| Cybersecurity | ~6 | Krebs, Bleeping Computer, Dark Reading |
| Climate | ~3 | NASA Climate, Carbon Brief, Climate Home |
| Disasters | ~4 | GDACS, Volcano Discovery, etc. |
| Commodities | ~4 | Mining.com, S&P Global |
| Regional | ~20 | Asia, Europe, Middle East, Africa, LatAm, Russia/Eurasia |

## Server Architecture

**Production (`server.js`, 24.5KB, zero dependencies):**
- Static file serving with cache headers and gzip
- API proxy with domain allowlist (10 whitelisted domains)
- AI provider proxy with server-side key injection
- In-memory response cache (2 min TTL general, 5 min AI)
- Rate limiting (120 req/min/IP general, 12 req/hr/IP AI)
- Concurrency control (max 30 outbound, queue overflow)
- Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)

**Dev (`vite.config.ts`, 25.5KB):**
- Mirrors all prod proxy endpoints as Vite middleware
- Same concurrency limiter and cache behavior
- Diagnostic endpoints: `/api/proxy-stats`, `/api/ai/status`

## Proposed Future Phases

| Phase | Scope |
|-------|-------|
| Phase 1 | Test infrastructure (unit + integration) |
| Phase 2 | Mobile responsive layout |
| Phase 3 | Notification / alerting system |
| Phase 4 | Historical data storage + trend analysis |
| Phase 5 | User configuration persistence (server-side) |
| Phase 6 | Deployment pipeline (Docker, CI/CD) |
