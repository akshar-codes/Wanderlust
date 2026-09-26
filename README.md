# Wanderlust

Wanderlust is a full-stack travel stay platform. Guests can discover and book listings, save favorites, message hosts, and leave reviews. Hosts can manage listings and bookings, while administrators moderate platform activity.

## Features

- Responsive React interface with listing search, filters, maps, and listing pages
- Account registration, email verification, password recovery, optional Google/GitHub sign-in, and two-factor authentication
- Listing creation with image uploads, availability, reviews, and booking management
- Wishlists and shareable collections, notifications, and booking conversations
- Admin tools for users, listings, bookings, reviews, and reports
- Express REST API with session authentication, role-based authorization, CSRF protection, rate limits, request validation, and security headers
- OpenAPI specification and interactive API reference

## Technology

- Frontend: React 18, Vite, React Router, TanStack Query, Material UI
- Backend: Node.js 24, Express 5, Mongoose, MongoDB, Passport
- Integrations: Cloudinary for image storage, Mapbox for maps/geocoding, SMTP for account email
- Tests: Vitest, Supertest, Testing Library, Playwright
- Deployment: Docker Compose, with MongoDB configured as a single-node replica set

## Requirements

- Node.js 24 (the backend declares Node `24.16.0`)
- npm
- MongoDB running as a replica set; transaction support is needed for booking flows
- Cloudinary and Mapbox credentials for image upload and map features

## Local development

1. Install dependencies:

   ```bash
   npm install
   npm --prefix backend install
   npm --prefix frontend install
   ```

2. Create `backend/.env` using [`backend/.env.example`](backend/.env.example). Set `MONGO_URL` to your MongoDB replica set, and provide a `SESSION_SECRET` of at least 32 characters and a Mapbox token in `MAP_TOKEN`.

3. (Optional) Create `frontend/.env` from [`frontend/.env.example`](frontend/.env.example). Set `VITE_MAPBOX_TOKEN` to enable map rendering. Change `VITE_API_URL` only if the API is not at `http://127.0.0.1:8080`; it configures the Vite development proxy.

4. Start the API and frontend in separate terminals:

   ```bash
   npm --prefix backend run dev
   npm --prefix frontend run dev
   ```

   Open <http://127.0.0.1:5173>. The API listens on <http://127.0.0.1:8080> and the frontend proxies `/api` requests to it.

The API checks required environment variables at startup. Production additionally requires HTTPS `FRONTEND_URL`, Cloudinary credentials, and SMTP credentials. See the environment example and `backend/src/config/validateEnv.js` for the enforced rules. OAuth providers are optional; configure both the client ID and secret for a provider, plus an HTTPS `BASE_URL` in production.

## Docker Compose

Copy `backend/.env.example` to `backend/.env`, replace the local values with production settings (including an HTTPS `FRONTEND_URL`, SMTP and Cloudinary credentials, and strong secrets), then run:

```bash
docker compose up --build
```

The Compose stack starts MongoDB with a replica set, the API, and the Nginx-served frontend. The frontend is exposed on port 80. Set production-quality secrets and service credentials before using this setup outside local development.

## Useful commands

Run commands from the repository root unless noted.

| Command | Purpose |
| --- | --- |
| `npm --prefix frontend run lint` | Lint frontend source |
| `npm --prefix frontend run build` | Build the frontend |
| `npm --prefix frontend test` | Run frontend tests |
| `npm run test:backend` | Run backend unit tests |
| `npm --prefix backend run test:integration` | Run backend integration tests |
| `npm --prefix backend run test:security` | Run backend security tests |
| `npm --prefix backend run validate:api` | Validate the OpenAPI document |
| `npm run e2e` | Run Playwright end-to-end tests |

Backend integration tests use an in-memory MongoDB replica set. End-to-end tests start the backend and frontend; configure a reachable test MongoDB and backend environment first. Playwright browsers may need to be installed with `npx playwright install chromium`.

To load generated development data, set `MONGO_URL` and `ADMIN_PASS`, then run `npm --prefix backend run seed`. **Seeding clears existing seeded collections by default.** Set `SEED_CLEAR=false` to retain existing data. Do not run the seeder against a database whose contents you need to preserve.

## API and project layout

- OpenAPI source: [`docs/openapi.yaml`](docs/openapi.yaml)
- Interactive API docs: <http://127.0.0.1:8080/api/docs>
- API health: <http://127.0.0.1:8080/api/health>
- Frontend source: `frontend/src/`
- API routes, services, models, and validation: `backend/src/`
- Backend migrations: `backend/migrations/`
- Backend test suites: `backend/tests/`
- Browser tests: `e2e/specs/`

The API is mounted under `/api`; feature routes include auth, listings, bookings, reviews, search, users, wishlists, messages, notifications, analytics, and admin. The OpenAPI document is the detailed endpoint reference.

## Security and configuration

Never commit `.env` files, real credentials, or production user data. Use HTTPS and unique secrets in production, set `CORS_ORIGINS` to the exact frontend origins, and configure `TRUST_PROXY_HOPS` to match the trusted reverse proxy topology. API documentation is disabled in production unless `SWAGGER_ENABLED=true` is set.

## License

ISC. See [`backend/package.json`](backend/package.json).
