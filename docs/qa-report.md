# QA report — 2026-10-29

## Rules → covering test

| Rule (requirements.md) | Covered by |
|---|---|
| R1 Roll adds dice sum; only 6 & 6 busts | `game.spec.ts` (AC3.1, AC4.1–4.2) · `games.e2e-spec.ts` roll/bust |
| R2 Win only on Hold, Global ≥ Winning | `game.spec.ts` win (AC6.1–6.2) · e2e win |
| R3 Creator starts | `game.spec.ts` create · e2e AC2.1 |
| R4/R5 Winning Score 10–1000 int, default 100, fixed | `game.spec.ts` (bounds, 50.5, NaN) · e2e AC2.2–2.3 |
| R6 Opponent ≠ self (any case), unknown opponent auto-created | `game.spec.ts` SelfPlay · e2e AC2.4–2.5 |
| R7 Username 3–20 `[a-zA-Z0-9_]`, case-insensitive | `username.spec.ts` · `auth.e2e-spec.ts` AC1.2–1.3 |
| R8 One active Game; New Game abandons (no winner/Win Count) | e2e AC7.1–7.3 · `game.spec.ts` abandon |
| R9 Bust lock UI-only, 1.5s, from `bust` flag | `useBustLock.test.ts` (fake timers) · **manual**: not reproducible live (random dice) |
| R10 Username-only JWT; two seats on one page | `auth.e2e-spec.ts` AC1.1–1.4 · `seatFor.test.ts` · manual browser (S5) |
| Error contract 400/401/403/404/409 as `ApiErrorDto` | `games.e2e-spec.ts` (exact bodies) · `auth.e2e-spec.ts` |
| S8 Win Count | e2e AC8.1–8.2 · `winsLabel.test.ts` · manual browser (S6) |
| AC1.5/1.6 Login screen + default Game | `defaultOpponent.test.ts` · manual browser (S5) |
| R11 `bot` reserved; Bot in many Games | e2e AC10.2, AC10.6 · live smoke |
| R12 Bot Strategy: hold at 20 or when it would Win | `bot-strategy.spec.ts` · `bot-player.spec.ts` (AC10.4) |
| R13 Bot Turn played server-side; `botSteps` in response; human Bust still reported | e2e AC10.3–10.5 · live smoke (rolls → Hold or Bust) |
| R14 Human starts vs Bot | e2e AC10.1 |
| AC10.7–10.9 Replay: thinking pauses, dice, skip, Win held back | `botReplay.test.ts` (timeline, scores, Win hidden) · manual browser |

Gaps: none in the rules. The bust overlay is verified only through the hook test and code review.

## Results

- `npm run lint` ✅ · `npm run typecheck` ✅
- api unit **30/30** · api e2e **33/33** · web **20/20**
- Fresh clone → `npm install && npm run build` ✅
- API smoke test (`node smoke.mjs` on a running API): create → 401 without a token → 403 on the opponent's Turn → play to a Win → 409 Hold when finished → Win Count 1 → 6&6 bust flag and Turn passes → New Game abandons → 409 Roll on Abandoned → Win Count unchanged — **10/10 PASS**
- Browser (S5/S6): login, R/H keys, Turn pass, self-play error, custom target, Win overlay, Play again, Win Count ✅

## Re-verification with S10 Bot opponent — 2026-10-29

- lint ✅ · typecheck ✅ · api unit **37/37** · api e2e **39/39** · web **25/25**
- Live API smoke (`smoke-bot.mjs`): login as `BOT` → 400 · vs Bot human starts · 401 without a token · Bot in two Games · steps are rolls ending in a Hold or a Bust · Bot Wins and its Win Count goes up · 409 Hold when finished · 403 in someone else's Game — **10/10 PASS** (two runs)
- Browser: vs Bot checkbox → one seat · thinking indicator → dice → Round Score climbing → Hold → back to the human · Space skips · no console errors ✅

| # | Severity | Finding | Decision |
|---|---|---|---|
| F9 | Medium | After the replay the dice showed the roll before the Bot Turn (response `lastRoll` is the human's) | **Fixed**: re-fetch the Game when a replay ends or is skipped (`GameContainer.tsx`, `useGame.ts`); browser shows the Bot's last roll, matching `GET` |
| F10 | Low | The Bot's card said "YOUR TURN" | **Fixed**: "BOT'S TURN" (`PlayerCard.tsx`) |
| F11 | Low | Two User lookups per action vs Bot (`games.service.ts:70,78`) | Ignored: in-memory, no measurable cost |

## Findings (first pass)

| # | Severity | Finding | Where |
|---|---|---|---|
| F1 | **High** | Root `npm run dev` starts only the API: npm runs workspace scripts one after another, and `nest --watch` never exits, so the web app never starts. The README run instructions are wrong. | `package.json:6` |
| F2 | Medium | README says "no frontend tests", but there are now 20 Vitest tests. | `README.md:61` |
| F3 | Low | The test double `FakeDiceRoller` lives in `src/` and ships in `dist/`. | `apps/api/src/games/infrastructure/fake-dice-roller.ts` |
| F4 | Low | Dead branch: `/users/me` throws 401 when the user is missing, but `JwtStrategy.validate` already does that. | `apps/api/src/users/presentation/users.controller.ts:16` |
| F5 | Low | `startGame()` throws away the created `GameStateDto`, so New game does an extra `GET`. | `apps/web/src/hooks/useGame.ts:50`, `hooks/startGame.ts` |
| F6 | Low | Dead code: `apiClient.me` is never used. | `apps/web/src/api/client.ts` |
| F7 | Info | The domain imports `@dice/contracts` (the `GameStatus` type and the `WINNING_SCORE_*` constants). It has no framework imports, but it is coupled to the contract package. | `apps/api/src/games/domain/game.ts:1`, `errors.ts:1` |
| F8 | Info | `GamesService.roll` draws dice before the Turn check, so a rejected roll uses up a random draw. It has no effect on behaviour. | `apps/api/src/games/application/games.service.ts` |

The rest of the audit is clean:
- No framework imports in `domain/`.
- Controllers only map HTTP and DTOs.
- No contract types are duplicated.
- No game rules live in `apps/web`: everything reads `status`, `currentPlayerId` or `lastRoll.bust`, and the only arithmetic is the "N to go" label (S5 D3).
- Repository and DiceRoller sit behind ports (DIP).
- No `any`.
- No secrets committed: the JWT secret has only a dev fallback, `.env` is gitignored, and `.env.example` is present.

## Resolution (user: "agree to recomendations")

| # | Outcome |
|---|---|
| F1 | ✅ Fixed: root `dev` uses `concurrently` (api + web); verified that both ports come up and `/api` is proxied |
| F2 | ✅ Fixed: README test trade-off is accurate |
| F3 | ✅ Fixed: `FakeDiceRoller` moved to `apps/api/test/`, no longer in `dist/` |
| F4 | ✅ Fixed: `/users/me` uses `UsersService.getById`; dead 401 branch removed |
| F5 | ✅ Fixed: `startGame()` returns `{ session, game }`; New game caches it with no extra GET |
| F6 | ✅ Fixed: unused `apiClient.me` removed |
| F7 | Accepted: README trade-off "contracts is a shared kernel" |
| F8 | Ignored: no effect on behaviour |

Release readiness: README has run steps, Assumptions, Trade-offs and With more time ✅ · `apps/api/.env.example` ✅ · `.gitignore` (node_modules, dist, .env) ✅ · no secrets tracked ✅ · fresh clone `npm install && npm run build` ✅ · `npm run dev` starts both apps ✅. Gates after fixes: lint ✅ typecheck ✅ api 30 + 33 ✅ web 20 ✅.
