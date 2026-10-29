---
name: architect
description: Architect step for the dice-game assignment — designs the monorepo, DDD layers, NestJS modules, REST contract, shared contracts package and an ordered list of vertical slices. Use after /product, or when structure/API decisions need revisiting.
---

# /architect

Follow `.claude/skills/_shared/PROTOCOL.md` throughout.

## Goal
Produce `docs/architecture.md` and `packages/contracts` type definitions, plus ADRs for hard-to-reverse choices.

## Settled (do not re-ask)
npm-workspaces monorepo `apps/api` (NestJS), `apps/web` (Vite+React), `packages/contracts` (types only) · in-memory repositories behind ports, SQLite optional · username-only login → JWT guard (ADR 0001) · `DiceRoller` port · two real Users per Game, wrong Turn → 403.

## Decisions to propose (options + recommendation, one round)
- **Domain model**: `Game` aggregate root owning `Player`s and Turn state vs. separate Turn entity; where the Win Count lives (User aggregate vs. read-model/stats service updated on `GameWon`).
- **Layering**: per bounded context `domain/ application/ infrastructure/ presentation/` vs. flatter Nest default; how use cases are expressed (application services vs. one class per command).
- **API contract**: endpoints (e.g. `POST /auth/login`, `POST /games`, `GET /games/:id`, `POST /games/:id/roll`, `POST /games/:id/hold`, `GET /users/me/stats`); every mutating call returns the full `GameStateDto` vs. minimal deltas; error shape.
- **Domain errors → HTTP**: exception filter mapping vs. throwing Nest exceptions in services.
- **Frontend data layer**: TanStack Query vs. plain `useReducer` + fetch client; where two tokens live (per-seat context).
- **Config/validation**: `@nestjs/config`, global `ValidationPipe`, CORS.

## Output
- `docs/architecture.md`: context diagram (mermaid), folder tree, aggregate invariants, endpoint table, error table.
- `packages/contracts/src/*.ts`: DTO/response types shared by api and web.
- **Ordered vertical slices** for `/developer`, e.g. `S0 scaffold+tooling`, `S1 domain Game + unit tests`, `S2 auth`, `S3 games API + e2e`, `S4 web shell + login seats`, `S5 game board`, `S6 extras (Win Count, Bust lock)`.
- ADRs where warranted; log in SESSION-LOG.

## Hand off
➡️ Next step: `/designer`
Suggested prompt: `/designer build 2 clickable HTML prototypes for the game screen per docs/requirements.md and docs/architecture.md`
