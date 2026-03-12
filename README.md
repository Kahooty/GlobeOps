```
  ┌─────────────────────────────────────┐
  │         GLOBEOPS v1.0.0             │
  │   Real-Time Intelligence Dashboard  │
  └─────────────────────────────────────┘
```

# GlobeOps

Real-time global intelligence operations dashboard. 24 modular panels aggregating 97 RSS feeds and 7 live APIs into a CLI-styled terminal interface with an ASCII world map.

Built with React 19, TypeScript, Vite 7, Tailwind CSS 4, and Zustand. Zero backend dependencies — runs on a single Node.js process.

---

## Quick Start

```bash
git clone <your-repo-url>
cd globeops
npm install
npm run dev
```

Open `http://localhost:5173`

## Production

```bash
npm run build
npm start          # serves on port 3000 (or PORT env)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server with HMR + API proxy (port 5173) |
| `npm run build` | TypeScript check + production build |
| `npm start` | Production server — static files + API proxy |
| `npm run preview` | Preview production build via Vite |

---

## Panels

24 drag-to-reorder panels across 6 categories:

**Core** — World Map, Live Feed, World Status, Region Monitor, Threat Board, Market Terminal, System Status

**Intelligence** — AI Analytics, AI Strategic Posture, Intel Feed, Conflict Tracker, CII Index, Prediction Markets

**Situational** — Emergency Alerts, Weather/Natural Events, Live News, Transport Intel

**OSINT & Feeds** — Telegram Feed, Displacement Tracker

**Markets & Econ** — Crypto Monitor, Energy Analytics, Economic Indicators, Supply Chain

**Utility** — World Clock

---

## Data Sources

### RSS Feeds (97 feeds across 25 categories)

World news, defense, government, think tanks, finance, tech, science, energy, humanitarian, cybersecurity, climate, natural disasters, commodities, maritime, nuclear, space — plus regional feeds for Asia, Europe, Middle East, Africa, Latin America, Pacific, and Russia/Eurasia.

### Live APIs

| Source | Data | Refresh |
|--------|------|---------|
| USGS | Earthquakes | 5 min |
| NASA EONET | Natural events | 15 min |
| NOAA | Weather alerts | 15 min |
| GDELT | Geopolitical events | 15 min |
| CoinGecko | Crypto markets | 60 sec |
| Polymarket | Prediction markets | 5 min |
| OpenSky | Aircraft tracking | 30 sec |

### Static Datasets (bundled)

Military installations, nuclear facilities, pipelines, data centers, maritime trade routes, strategic waterways.

---

## Configuration

### Environment Variables (optional)

Create a `.env` file in the project root (see `.env.example`):

```env
# AI provider keys — server-side only, never exposed to the browser bundle
AI_GOOGLE_KEY=             # Google Gemini 2.0 Flash (recommended — fast + affordable)
AI_ANTHROPIC_KEY=          # Anthropic Claude Sonnet
AI_OPENAI_KEY=             # OpenAI GPT-4o Mini

# Data source keys
VITE_ACLED_API_KEY=        # Armed conflict data (acleddata.com)
```

All keys are optional. The dashboard runs fully without them — AI panels fall back to local keyword analysis, and data panels show a configuration prompt.

### AI Providers

The **AI Analytics** and **AI Strategic Posture** panels support three AI providers. Select the active provider from the dropdown in the AI Analytics panel header.

| Provider | Model | Key Variable |
|----------|-------|-------------|
| Google Gemini (recommended) | gemini-2.0-flash | `AI_GOOGLE_KEY` |
| Anthropic Claude | claude-sonnet-4-20250514 | `AI_ANTHROPIC_KEY` |
| OpenAI GPT | gpt-4o-mini | `AI_OPENAI_KEY` |
| Computed (no key) | — | — |

AI keys are stored server-side and proxied through `/api/ai`. They never appear in the client JavaScript bundle. When no AI keys are configured, the computed fallback generates briefings using keyword analysis — no API calls are made.

### Themes

5 color schemes: Green, Amber, Cyan, Red, White. Cycle with the `[GRN]` button in the header.

### Layouts

Multiple preset layouts optimized for different workflows. Switch via the `[LAYOUT]` dropdown.

---

## Architecture

```
src/
├── components/
│   ├── layout/          # Dashboard grid + header
│   ├── panels/          # 24 data panels + world map subsystem
│   └── terminal/        # Terminal UI primitives (window, command line, CRT overlay)
├── config/              # Feed sources, data sources, layout presets, constants
├── data/                # Static geographic datasets
├── hooks/               # React Query data hooks
├── services/            # API clients + feed parsing
├── store/               # Zustand state (persisted to localStorage)
├── types/               # TypeScript definitions
└── utils/               # ASCII rendering, map projection
```

**Proxy layer** — Both dev (`vite.config.ts` middleware) and production (`server.js`) provide `/api/rss`, `/api/proxy`, and `/api/ai` endpoints. The AI proxy keeps API keys server-side while routing requests to Google, Anthropic, or OpenAI.

**Production server** (`server.js`) — Zero-dependency Node.js HTTP server. Includes:
- Static file serving with cache headers
- API proxy with domain whitelist
- AI provider proxy with server-side key management
- In-memory response cache (2 min TTL for RSS/proxy, 5 min for AI)
- Rate limiting (120 req/min/IP general, 12 req/hr/IP for AI)
- Concurrency control (max 30 outbound requests)
- Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)

---

## Hosting

Works on any platform that runs Node.js 18+:

```bash
# Set port (default: 3000)
PORT=8080 npm start
```

**Docker** (minimal):
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY dist/ dist/
COPY server.js .
EXPOSE 3000
CMD ["node", "server.js"]
```

**Platform notes:**
- Render, Railway, Fly.io — set `PORT` env var, build command: `npm run build`, start command: `npm start`
- Static hosts (Vercel, Netlify) — will serve the frontend but **not** the API proxy; data panels will fail without a separate proxy deployment

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 19 + TypeScript 5.9 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| State | Zustand 5 (localStorage persistence) |
| Data | TanStack React Query 5 |
| Layout | react-grid-layout |
| Server | Vanilla Node.js (zero dependencies) |

---

## License

MIT
