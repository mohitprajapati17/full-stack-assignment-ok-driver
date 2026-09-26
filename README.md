# okDriver – Centralized CCTV Monitoring & Video Analytics

A full-stack platform for monitoring CCTV cameras, reviewing detections, managing watchlists,
and tracking alerts and movement history.

> **Status:** project scaffold only. Business features are not implemented yet.

## Tech stack

| Layer    | Technology                                                   |
| -------- | ------------------------------------------------------------ |
| Frontend | React 19, Vite, React Router, TanStack Query, Tailwind CSS 4 |
| Backend  | Node.js, Express 5, Mongoose, Zod                            |
| Database | MongoDB                                                      |
| Planned  | Socket.IO, JWT auth, Leaflet maps, Docker                    |

## Repository layout

```
.
├── client/                 # React + Vite web app
│   └── src/
│       ├── app/            # App providers and router
│       ├── components/     # Shared components (layout/, ui/)
│       ├── features/       # Feature modules: auth, cameras, detections, watchlist,
│       │                   #   alerts, movements, audit-logs, dashboard, health
│       ├── hooks/          # Shared React hooks
│       ├── lib/            # API client, TanStack Query client
│       └── pages/          # Route-level pages
└── server/                 # Express API
    └── src/
        ├── config/         # Env validation (Zod) and MongoDB connection
        ├── middlewares/    # Error handling, 404, (later) auth
        ├── models/         # Mongoose models
        ├── modules/        # Feature modules: routes + controllers + services
        │                   #   health, auth, users, cameras, detections, watchlist,
        │                   #   alerts, movements, audit-logs, dashboard
        ├── routes/         # Mounts module routers under /api
        ├── sockets/        # Socket.IO handlers (planned)
        ├── utils/          # Shared helpers (ApiError, ...)
        ├── validators/     # Shared request validation schemas
        ├── app.js          # Express app factory
        └── server.js       # Entry point: connects DB, starts HTTP server
```

Each feature module keeps its own `*.routes.js`, `*.controller.js`, `*.service.js`, and
`*.validation.js` files. `server/src/modules/health` is the reference example.

## Prerequisites

- Node.js **20.19+** (tested with Node 24)
- MongoDB **6+** running locally, or a MongoDB Atlas connection string

## Setup

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Create env files
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### Environment variables

**server/.env**

| Variable        | Default                              | Description                                |
| --------------- | ------------------------------------ | ------------------------------------------ |
| `NODE_ENV`      | `development`                        | `development`, `test`, or `production`     |
| `PORT`          | `4000`                               | API port                                   |
| `MONGODB_URI`   | – (required)                         | e.g. `mongodb://127.0.0.1:27017/okdriver`  |
| `CLIENT_ORIGIN` | `http://localhost:5173`              | Comma-separated CORS allowlist             |

The server validates these at startup and exits with a clear message if any are invalid.

**client/.env**

| Variable                    | Default                 | Description                             |
| --------------------------- | ----------------------- | --------------------------------------- |
| `VITE_API_BASE_URL`         | `/api`                  | Base URL for API calls from the browser |
| `VITE_DEV_API_PROXY_TARGET` | `http://localhost:4000` | Where Vite proxies `/api` in dev        |

## Running locally

Start MongoDB first (for example `brew services start mongodb-community`, or
`docker run -d -p 27017:27017 mongo:7`).

```bash
# Terminal 1 – API on http://localhost:4000
cd server
npm run dev

# Terminal 2 – web app on http://localhost:5173
cd client
npm run dev
```

The home page shows live API and database status from `GET /api/health`.

### Health check

```bash
curl http://localhost:4000/api/health
```

```json
{
  "status": "ok",
  "uptime": 12,
  "timestamp": "2026-09-26T16:45:00.000Z",
  "services": { "database": "connected" }
}
```

Returns `200` when MongoDB is connected and `503` (`"status": "degraded"`) otherwise.

## Scripts

| Location | Command                  | Description                        |
| -------- | ------------------------ | ---------------------------------- |
| server   | `npm run dev`            | Start API with auto-restart        |
| server   | `npm start`              | Start API (production)             |
| client   | `npm run dev`            | Start Vite dev server              |
| client   | `npm run build`          | Production build to `client/dist`  |
| client   | `npm run preview`        | Preview the production build       |
| both     | `npm run lint`           | Run ESLint                         |
| both     | `npm run format`         | Format with Prettier               |
| both     | `npm run format:check`   | Check formatting                   |

## Roadmap

- [ ] JWT authentication and role-based access
- [ ] Cameras CRUD and live status
- [ ] Detections ingestion and search
- [ ] Watchlist management and matching
- [ ] Realtime alerts via Socket.IO
- [ ] Movement history on a Leaflet map
- [ ] Audit logs
- [ ] Dashboard metrics
- [ ] Dockerfiles and docker-compose
