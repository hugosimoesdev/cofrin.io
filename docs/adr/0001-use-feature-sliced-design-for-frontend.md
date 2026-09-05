# 0001. Use Feature-Sliced Design for Frontend

## Status

Accepted

## Context

The frontend started as a small Vite React app, but it already has reusable UI primitives, a shared table wrapper, API calls, and page-level composition. Keeping everything under generic folders such as `components` and `lib` would make ownership less clear as product features grow.

## Decision

Organize `apps/frontend/src` with Feature-Sliced Design layers. Use `app` for bootstrap and global styles, `pages` for route-level composition, `widgets` for self-contained UI blocks, `features` when user actions become reusable product capabilities, `entities` for domain API/model code, and `shared` for business-agnostic UI and utilities.

Slices in `pages`, `widgets`, and `entities` must expose public APIs through `index.ts`. Code outside a slice should import from those public APIs instead of internal `ui`, `api`, or `model` files.

## Consequences

Imports should flow downward through the layers: `app` -> `pages` -> `widgets` -> `features` -> `entities` -> `shared`. This adds some folder structure early, but it keeps future frontend changes easier to place and review.

## Follow-ups

Add architecture linting only if manual import discipline starts to fail.
