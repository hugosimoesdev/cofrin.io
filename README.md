# cofrin.io

Quarkus + React Vite monorepo.

## Stack

- Backend: Java 21, Quarkus, Maven
- Frontend: React, TypeScript, Vite
- Monorepo: npm workspaces
- Local orchestration: npm scripts or Docker Compose

## Project Structure

```text
apps/
  backend/   Quarkus API
  frontend/  Vite React app
```

## Local Development

Install frontend dependencies:

```sh
npm install
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

```sh
docker compose up
```

## Build and Test

```sh
npm run build
npm run test
```
