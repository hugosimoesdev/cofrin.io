# 0003. Documentation Placement Rules

## Status

Accepted

## Context

The repository needs enough documentation for contributors and AI agents to work consistently, but it should not grow scattered docs that duplicate code structure or hide everyday rules in long files.

## Decision

Use `AGENTS.md` for concise contributor and agent instructions that affect everyday work. Use `README.md` for project overview, setup, and common local commands. Use `docs/` for longer architecture, API, deployment, domain, or process documentation. Use `docs/adr/` for decisions that need context, tradeoffs, and consequences.

Architecture or process decisions should use numbered ADR filenames, such as `0001-use-feature-sliced-design-for-frontend.md`.

## Consequences

Contributors have a clear rule for when to update existing documentation and when to create new documentation. This keeps `AGENTS.md` practical while preserving decision history in ADRs.

## Follow-ups

Do not create documentation files just to mirror code structure. Add docs only when they explain decisions, workflows, or constraints that are not obvious from the code.
