# Dice Game — Home Assignment

Two-player dice game: all rules live in a NestJS API, a React app only renders state and sends actions.

## How to run

_TBD (filled by /developer S0)_

## Architecture

- npm-workspaces monorepo: `apps/api` (NestJS), `apps/web` (Vite + React), `packages/contracts` (shared DTO types).
- All rules live in one pure `Game` aggregate (no Nest imports); the `DiceRoller` and repository ports are injected.
- Domain errors are mapped to 400/403/409 by one global filter ([ADR 0002](docs/adr/0002-domain-errors-mapped-by-global-filter.md)).
- Every game call returns the full `GameStateDto`; the web app only renders it (TanStack Query cache).
- Two "seats" on one page, each with its own JWT. Details: [docs/architecture.md](docs/architecture.md).

## Scope — optional extras

| Extra | Status | Why |
|---|---|---|
| 1. Track wins per player | ✅ In (Should) | Small domain addition (Win Count on `GameWon`); shows the model extends cleanly. |
| 4. Lock actions + message on 6 & 6 | ✅ In (Should) | Cheap, high UX value; purely presentational on top of a `bust` flag from the API. |
| 2. Persist data | ⏳ If time (Could) | Repository port already isolates storage; in-memory is enough to demo the rules. |
| 3. AI opponent | ❌ Cut | Needs a strategy service + auto-play loop + a non-human "player" identity — a second feature, not a 2h addition. Would plug in as a `PlayerStrategy` on the server. |
| 5. Sound / music | ❌ Cut | Pure polish; no signal about architecture or trade-offs. |

## Assumptions

- A Roll adds the sum of both dice to the Round Score; only 6 & 6 busts. The inspirational demo (classic "Pig") likely also busts on a 1 — we followed the written brief instead.
- A Win is checked only on Hold (Global Score ≥ Winning Score), not mid-roll.
- Winning Score is set in the New Game form (integer 10–1000, default 100) and fixed for that Game. The demo's always-visible input was not adopted.
- The opponent must be a different User; an unknown opponent username is created on the fly. Usernames are 3–20 chars `[a-zA-Z0-9_]`, case-insensitive.
- One active Game per User; either Player may start a New Game.
- Full stories + acceptance criteria: [docs/requirements.md](docs/requirements.md).
- "New game at any time" abandons the current Game: no winner, no Win Count change.
- Player 1 starts.
- Both users are simulated on one page, each with their own login/token (split screen).

## Trade-offs

- **Username-only login + JWT guard** instead of passwords — see [ADR 0001](docs/adr/0001-username-only-authentication.md).
- **In-memory storage** behind a repository port — swapping in SQLite is one adapter.
- **Win Count incremented synchronously** in the hold use case instead of a domain-event bus — less wiring; an event is the obvious next step.
- **One application service per module** instead of CQRS handlers — four use cases don't justify the ceremony.
- **Backend-heavy tests** (domain unit + API e2e), no frontend tests — the rules live in the API.

## With more time

- Passwords (bcrypt) and refresh tokens.
- Persistent DB (SQLite/Postgres) via the existing repository port.
- Frontend component tests and a Playwright happy path.
- AI opponent: server-side `PlayerStrategy` (e.g. "hold at round score ≥ 20") driving a bot User's Turns.
- Sound effects on roll / bust / win.

## How I used AI

Built with Claude Code using project skills (`.claude/skills/`: product → architect → designer → developer → qa). Every prompt and decision is logged in [`docs/ai-log/`](docs/ai-log/).
