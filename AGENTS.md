# Repository Guidelines

## Project Structure & Module Organization

This is a Quarkus + React Vite monorepo. Backend code lives in `apps/backend`, with Java sources under `src/main/java`, resources under `src/main/resources`, Flyway migrations under `src/main/resources/db/migration`, and tests under `src/test/java`. Frontend code lives in `apps/frontend/src` and follows Feature-Sliced Design: `app` for bootstrap/styles, `pages` for route-level composition, `widgets` for self-contained UI blocks, `entities` for domain API/model code, and `shared` for business-agnostic UI/lib utilities.

## Build, Test, and Development Commands

- `npm install`: install root and frontend workspace dependencies.
- `npm run dev`: run Quarkus and Vite together for local development.
- `npm run dev:backend`: start Quarkus dev mode from `apps/backend`.
- `npm run dev:frontend`: start the Vite dev server on `http://localhost:5173`.
- `npm run build`: build the frontend and package the backend.
- `npm run test`: run Vitest and Maven tests.
- `docker compose up`: run frontend, backend, and PostgreSQL services locally.

## Coding Style & Naming Conventions

Follow `.editorconfig`: UTF-8, LF endings, spaces, final newline, and trimmed trailing whitespace. Use 2-space indentation by default and 4 spaces for Java. Frontend components use PascalCase exports; files use kebab case such as `home-page.tsx`. Prefer the configured `@/...` alias for frontend imports from `src`.

## Frontend Architecture

Use FSD public APIs. Slices in `pages`, `widgets`, and `entities` should expose `index.ts`; outside modules should import from those indexes, not internal `ui`, `api`, or `model` paths. Imports may only point downward through the layers: `app` -> `pages` -> `widgets` -> `features` -> `entities` -> `shared`. Do not put business logic in `shared`.

## Testing Guidelines

Frontend tests use Vitest and should live near the code as `*.test.ts` or `*.test.tsx`. Backend tests use JUnit through Quarkus and should be named `*Test.java`. Run `npm run test` before pushing changes. Backend tests may start PostgreSQL through Quarkus Dev Services/Testcontainers, so Docker should be available.

## Documentation Rules

Use `AGENTS.md` for concise contributor and agent instructions that affect everyday work. Keep it short and practical.

Use `README.md` for project overview, setup, and common local commands.

Create or update files under `docs/` only when the information is too detailed for `AGENTS.md` or `README.md`, such as architecture decisions, domain modeling notes, deployment guides, API contracts, or environment-specific runbooks.

When adding a new architecture or process decision, prefer an ADR under `docs/adr/` using a numbered filename like `0001-use-feature-sliced-design.md`.

Do not create documentation files just to mirror code structure. Add docs only when they explain decisions, workflows, or constraints that are not obvious from the code.

See `docs/adr/` for accepted architecture and process decisions.

## Commit & Pull Request Guidelines

Use Conventional Commits, matching the existing history: `chore: initialize monorepo`, `feat(backend): configure postgresql persistence`, `feat(frontend): add tanstack data table`. Prefer scopes such as `backend`, `frontend`, or `deps` when helpful. Pull requests should include a short description, linked issue when available, test results, and screenshots for visible frontend changes.

## Security & Configuration Tips

Do not commit `.env` files or secrets. Local PostgreSQL defaults are `cofrin`/`cofrin`; override with `DATABASE_JDBC_URL`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` for non-local environments.
