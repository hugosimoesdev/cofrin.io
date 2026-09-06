# cofrin.io

Quarkus + React Vite monorepo.

## Stack

- Backend: Java 21, Quarkus, Maven
- Ingestion: Python, FastAPI
- Frontend: React, TypeScript, Vite
- Monorepo: npm workspaces
- Local development: npm scripts with PostgreSQL from Docker Compose

## Project Structure

```text
apps/
  backend/   Quarkus API
  ingestion/ FastAPI file ingestion preview service
  frontend/  Vite React app
```

## Local Development

Set up the full local project:

```sh
npm run setup
```

This installs the Node workspace dependencies, starts Docker Compose infrastructure, prefetches backend Maven dependencies, and prepares the Python ingestion virtual environment.

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

Run only the ingestion service:

```sh
npm run setup:ingestion
npm run dev:ingestion
```

The frontend runs on `http://localhost:5173` and proxies `/api/*` requests to the Quarkus backend on `http://localhost:8080`.
The ingestion service runs on `http://localhost:8000`.

## Docker Compose

Docker Compose runs PostgreSQL for local development. The frontend, backend, and ingestion service can run through npm scripts.

```sh
docker compose up
```

Run PostgreSQL plus the optional ingestion service:

```sh
docker compose --profile ingestion up
```

## File Ingestion

The ingestion service is a specialized backend for parsing uploaded financial files. The first MVP supports Banco Inter CSV preview only:

```text
POST /imports/preview
multipart field: file
optional fields: institution=inter, sourceType=csv
```

It returns normalized transaction preview rows and row-level warnings. It does not write to PostgreSQL or create transactions. Quarkus remains responsible for accounts, categories, transaction validation, and persistence.

## Build and Test

```sh
npm run build
npm run test
npm run test:ingestion
```
