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

# 2. Create env files, then set JWT_SECRET in server/.env
cp server/.env.example server/.env
cp client/.env.example client/.env
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 3. Seed demo users and sample cameras (development only)
cd server && npm run db:seed
```

The seed script creates two accounts (override with `SEED_*` env vars):

| Role     | Email                     | Password         |
| -------- | ------------------------- | ---------------- |
| Admin    | `admin@okdriver.local`    | `Admin@12345`    |
| Operator | `operator@okdriver.local` | `Operator@12345` |

### Environment variables

**server/.env**

| Variable                | Default                 | Description                               |
| ----------------------- | ----------------------- | ----------------------------------------- |
| `NODE_ENV`              | `development`           | `development`, `test`, or `production`    |
| `PORT`                  | `4000`                  | API port                                  |
| `MONGODB_URI`           | – (required)            | e.g. `mongodb://127.0.0.1:27017/okdriver` |
| `MONGODB_MAX_POOL_SIZE` | `10`                    | Mongoose connection pool size             |
| `CLIENT_ORIGIN`         | `http://localhost:5173` | Comma-separated CORS allowlist            |
| `JWT_SECRET`            | – (required)            | At least 32 random characters             |
| `JWT_EXPIRES_IN`        | `8h`                    | Access token lifetime                     |

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

## API

All endpoints except `/api/health` and `/api/auth/login` require `Authorization: Bearer <token>`.
Errors use the shape `{ "error": { "message", "details"? } }`.

### Auth

| Method | Path              | Description                               |
| ------ | ----------------- | ----------------------------------------- |
| POST   | `/api/auth/login` | `{ email, password }` → `{ token, user }` |
| GET    | `/api/auth/me`    | Current user                              |

### Cameras

| Method | Path                          | Role  | Description                                         |
| ------ | ----------------------------- | ----- | --------------------------------------------------- |
| GET    | `/api/cameras`                | any   | List with search, filters, sorting and pagination   |
| GET    | `/api/cameras/filter-options` | any   | Distinct departments and zones for filter dropdowns |
| GET    | `/api/cameras/:id`            | any   | Camera details                                      |
| POST   | `/api/cameras`                | ADMIN | Create a camera                                     |
| PUT    | `/api/cameras/:id`            | ADMIN | Replace the camera configuration                    |
| PATCH  | `/api/cameras/:id/status`     | ADMIN | `{ status, lastHeartbeat? }`                        |
| DELETE | `/api/cameras/:id`            | ADMIN | Disable (soft delete); the record is kept           |

`GET /api/cameras` query parameters:

| Param        | Values                                                                                        | Default     |
| ------------ | --------------------------------------------------------------------------------------------- | ----------- |
| `search`     | Matches name, cameraId, department or zone (case-insensitive)                                 | –           |
| `status`     | `ONLINE`, `OFFLINE`, `DEGRADED`                                                               | –           |
| `department` | Exact department                                                                              | –           |
| `zone`       | Exact zone                                                                                    | –           |
| `isActive`   | `true`, `false`, `all`                                                                        | `true`      |
| `page`       | ≥ 1                                                                                           | `1`         |
| `limit`      | 1–100                                                                                         | `20`        |
| `sortBy`     | `name`, `cameraId`, `status`, `department`, `zone`, `lastHeartbeat`, `createdAt`, `updatedAt` | `createdAt` |
| `sortOrder`  | `asc`, `desc`                                                                                 | `desc`      |

Notes:

- `PUT` requires the full configuration; omitted optional fields are cleared. `status` and
  `lastHeartbeat` are only changed through `PATCH /status`. Send `isActive: true` to re-enable a
  disabled camera.
- Stream URL credentials (`rtsp://user:pass@host`) are masked as `***` for operators.
- Create, update, status changes and disable are recorded in the audit log.

## Tests

API integration tests use Node's built-in test runner against a real MongoDB. Each test file
creates and drops its own `okdriver_test_*` database.

```bash
cd server && npm test
```

## Scripts

| Location | Command                   | Description                          |
| -------- | ------------------------- | ------------------------------------ |
| server   | `npm run dev`             | Start API with auto-restart          |
| server   | `npm start`               | Start API (production)               |
| server   | `npm run db:sync-indexes` | Create/drop indexes to match schemas |
| server   | `npm run db:seed`         | Seed demo users and sample cameras   |
| server   | `npm test`                | Run API integration tests            |
| client   | `npm run dev`             | Start Vite dev server                |
| client   | `npm run build`           | Production build to `client/dist`    |
| client   | `npm run preview`         | Preview the production build         |
| both     | `npm run lint`            | Run ESLint                           |
| both     | `npm run format`          | Format with Prettier                 |
| both     | `npm run format:check`    | Check formatting                     |

## Roadmap

- [x] JWT authentication and role-based access (login only; user management pending)
- [x] Camera registry (CRUD, search, filters, pagination)
- [ ] Live camera heartbeats and status via Socket.IO
- [ ] Detections ingestion and search
- [ ] Watchlist management and matching
- [ ] Realtime alerts via Socket.IO
- [ ] Movement history on a Leaflet map
- [ ] Audit logs
- [ ] Dashboard metrics
- [ ] Dockerfiles and docker-compose
