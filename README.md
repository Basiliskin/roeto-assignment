# Dice Game — Home Assignment

Two-player dice game: all rules live in a NestJS API, a React app only renders state and sends actions.

## How to run

_TBD (filled by /developer S0)_

## Architecture

_TBD (filled by /architect — 5 bullets max)_

## Scope — optional extras

| Extra | Status | Why |
|---|---|---|
| 1. Track wins per player | ✅ In | Small domain addition (Win Count on `GameWon`); shows the model extends cleanly. |
| 4. Lock actions + message on 6 & 6 | ✅ In | Cheap, high UX value; purely presentational on top of a `bust` flag from the API. |
| 2. Persist data | ⏳ If time | Repository port already isolates storage; in-memory is enough to demo the rules. |
| 3. AI opponent | ❌ Cut | Needs a strategy service + auto-play loop + a non-human "player" identity — a second feature, not a 2h addition. Would plug in as a `PlayerStrategy` on the server. |
| 5. Sound / music | ❌ Cut | Pure polish; no signal about architecture or trade-offs. |

## Assumptions

- A Roll adds the sum of both dice to the Round Score; only 6 & 6 busts. The inspirational demo (classic "Pig") likely also busts on a 1 — we followed the written brief instead.
- A Win is checked only on Hold (Global Score ≥ Winning Score), not mid-roll.
- Winning Score is fixed when a Game is created (default 100).
- "New game at any time" abandons the current Game: no winner, no Win Count change.
- Player 1 starts.
- Both users are simulated on one page, each with their own login/token (split screen).

## Trade-offs

- **Username-only login + JWT guard** instead of passwords — see [ADR 0001](docs/adr/0001-username-only-authentication.md).
- **In-memory storage** behind a repository port — swapping in SQLite is one adapter.
- **Backend-heavy tests** (domain unit + API e2e), no frontend tests — the rules live in the API.

## With more time

- Passwords (bcrypt) and refresh tokens.
- Persistent DB (SQLite/Postgres) via the existing repository port.
- Frontend component tests and a Playwright happy path.
- AI opponent: server-side `PlayerStrategy` (e.g. "hold at round score ≥ 20") driving a bot User's Turns.
- Sound effects on roll / bust / win.

## How I used AI

Built with Claude Code using project skills (`.claude/skills/`: product → architect → designer → developer → qa). Every prompt and decision is logged in [`docs/ai-log/`](docs/ai-log/).
