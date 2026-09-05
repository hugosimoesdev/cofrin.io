# 0002. Use DDD and SOLID for Backend

## Status

Accepted

## Context

The backend is currently a single Quarkus module with a scaffold REST resource and PostgreSQL/Flyway support. The project needs a clear structure before real business behavior is added, but a Maven multi-module split would be premature at this size.

## Decision

Keep one Quarkus Maven module for now and organize Java packages by bounded context first. Inside each context, use `domain`, `application`, `interfaces`, and `infrastructure` packages.

Domain code contains entities, value objects, domain services, and domain exceptions. Application code contains use cases, commands, queries, and ports. Interfaces contain REST resources and transport DTOs. Infrastructure contains persistence adapters, Panache/JPA entities, configuration, and external integrations.

## Consequences

REST resources should stay thin and delegate to use cases. Domain code must remain framework-independent and should not import Quarkus, REST, JPA, Panache, or infrastructure classes. Persistence and external integrations should depend on application ports rather than leaking concrete adapters into business logic.

## Follow-ups

Create real bounded contexts only when the product language is clear. Use a neutral context such as `platform` or `system` for scaffold/status endpoints if needed.
