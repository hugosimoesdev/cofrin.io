# 0004. Use Container Hooks for Frontend Pages

## Status

Accepted

## Context

The transaction home page grew by combining server state, local workflow state, setup forms, mutations, derived totals, and rendering in one route component. This made the page harder to review and made it unclear where future frontend logic should live.

The project already uses Feature-Sliced Design, so the decision should fit the existing `pages/<slice>/model` and `pages/<slice>/ui` segments instead of introducing parallel folder names.

## Decision

For non-trivial frontend pages, keep route components thin. Put orchestration, data fetching hooks, mutations, local workflow state, validation, and derived view state in a page-level `model/use-*.ts` hook.

Keep `ui/` components presentational. They should receive plain props and callbacks, and should not import API clients, TanStack Query hooks, or mutation orchestration directly unless that component is intentionally acting as the page container.

Use FSD segment naming instead of literal `container/` and `presentation/` folders. For example, use `pages/home/model/use-transaction-workspace.ts` as the container hook and `pages/home/ui/*` for presentational views.

## Consequences

This creates a few more files for larger pages, but it keeps route components small, makes server-state ownership clearer, and gives UI components simpler inputs for review and testing.

Small pages can stay inline until they accumulate enough orchestration or rendering complexity to justify the split.
