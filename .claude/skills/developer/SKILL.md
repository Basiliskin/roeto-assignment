---
name: developer
description: Developer step for the dice-game assignment — implements exactly one vertical slice from docs/architecture.md (S0…Sn), proposing implementation options first, then writing code test-first. Use with a slice id, e.g. "/developer S1".
---

# /developer <slice>

Follow `.claude/skills/_shared/PROTOCOL.md` throughout.

## Goal
Deliver one slice, green and committed-ready, without scope creep.

## Steps
1. Read the slice definition in `docs/architecture.md`, the matching acceptance criteria in `docs/requirements.md`, and `docs/design.md` for UI slices. If no slice given, pick the next unfinished one and say so.
2. Propose **2–3 implementation options** for the slice's real choices (e.g. state machine via enum vs. State pattern; TanStack Query mutation vs. custom hook; CSS modules vs. plain CSS). Recommend one. **Wait** for the user.
3. Implement **test-first** where logic exists: domain → failing unit test → code → green. API slices get supertest e2e for happy path + 401/403/409/400.
4. Keep the bar:
   - Domain classes have no Nest/ORM imports; invariants enforced inside the `Game` aggregate.
   - Controllers only map HTTP ↔ application layer; DTOs validated; domain errors mapped by a filter.
   - React: no score/turn/win computation — render `GameStateDto` only; containers fetch, presentational components render.
   - Shared types come from `packages/contracts` (DRY), never duplicated.
5. Run `npm run lint`, `npm test`, and typecheck. Report real output; fix failures before handing off.
6. List files changed, log in SESSION-LOG, and propose a commit message (do not commit unless the user asks).

## Hand off
If slices remain:
➡️ Next step: `/developer`
Suggested prompt: `/developer S<next> <slice title from docs/architecture.md>`

If all slices are done:
➡️ Next step: `/qa`
Suggested prompt: `/qa verify the full build against docs/requirements.md and audit SOLID/KISS/DRY/DDD`
