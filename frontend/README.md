# Wanderlust frontend

The frontend is a React 18 single-page application built with Vite. It uses React Router for navigation, TanStack Query for API data, and Material UI for its component system.

## Development

Install dependencies from the repository root with `npm --prefix frontend install`, then start the Vite server:

```bash
npm run dev
```

The application is available at <http://127.0.0.1:5173>. Vite forwards `/api` requests to `http://127.0.0.1:8080` by default. Set `VITE_API_URL` in `frontend/.env` to change that proxy target.

Set `VITE_MAPBOX_TOKEN` in `frontend/.env` to enable map views. These `VITE_` values are embedded in the browser build, so do not put server-side secrets in them.

## Commands

Run these from `frontend/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint application source |
| `npm test` | Run Vitest tests |
| `npm run test:coverage` | Run tests with coverage |

The root [README](../README.md) covers API setup, environment variables, Docker Compose, and end-to-end tests. API details are in [`docs/openapi.yaml`](../docs/openapi.yaml).
