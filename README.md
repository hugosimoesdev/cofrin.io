# cofrin.io

Quarkus + React Vite monorepo.

## Stack

- Backend: Java 21, Quarkus, Maven
- Frontend: React, TypeScript, Vite
- Monorepo: npm workspaces
- Local development: npm scripts with PostgreSQL from Docker Compose

## Project Structure

```text
apps/
  backend/   Quarkus API
  frontend/  Vite React app
```

## Local Development

Set up the full local project:

```sh
npm run setup
```

This installs the Node workspace dependencies, starts Docker Compose infrastructure, and prefetches backend Maven dependencies.

If you only need frontend dependencies:

```sh
npm install
```

Start local PostgreSQL:

```sh
docker compose up
```

Run both dev servers:

```sh
npm run dev
```

Run only the backend:

```sh
npm run dev:backend
```

Run only the frontend:

```sh
npm run dev:frontend
```

The frontend runs on `http://localhost:5173` and proxies `/api/*` requests to the Quarkus backend on `http://localhost:8080`.

## Docker Compose

Docker Compose runs PostgreSQL for local development. The frontend and backend can run through npm scripts.

```sh
docker compose up
```

## Build and Test

```sh
npm run build
npm run test
```
