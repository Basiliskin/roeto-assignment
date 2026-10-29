# Requirements — Dice Game

Source of truth for *what* we build. Derived from `roeto-home-assignment .pdf`; the demo (`docs/reference/demo.png`) is inspiration only — the PDF wins on conflicts. Terms follow [GLOSSARY.md](../GLOSSARY.md).

## Settled rules & defaults

| # | Decision |
|---|---|
| R1 | A Roll adds the sum of both dice to the Round Score; only 6 & 6 is a Bust. |
| R2 | Win is checked on Hold only: Global Score ≥ Winning Score. |
| R3 | Player 1 (the creator) starts. |
| R4 | Winning Score is set in the New Game form and is immutable for that Game (D1). |
| R5 | Winning Score: integer 10–1000, default 100 (D2). |
| R6 | Opponent must be a different User; an unknown opponent username is created on the fly, same as login (D2). |
| R7 | Username: 3–20 chars `[a-zA-Z0-9_]`, case-insensitive. |
| R8 | A User has at most one active Game; starting a New Game Abandons it (no winner, no Win Count change). Either Player may start a New Game. |
| R9 | Bust lock is UI-only (~1.5s), driven by a `bust` flag in the API response. |
| R10 | Username-only login → JWT (ADR 0001). Both users are simulated on one page, each side with its own token. |
| R11 | The Bot is one system User `bot`; nobody can log in as `bot` (400). R8 does not apply to the Bot: it may be in many Games at once. |
| R12 | Bot Strategy: Hold when Round Score ≥ 20 or when Holding would Win; otherwise Roll. |
| R13 | A Bot Turn is played and saved on the server inside the request that ends the human's Turn (Hold or Bust); the response lists the Bot's steps (ADR 0003). |
| R14 | The human always starts a Game against the Bot. |

Error contract: **401** unauthenticated · **403** not your Turn / not a Player of this Game · **409** Game not in progress (Won or Abandoned) · **400** invalid input · **404** unknown Game.

## User stories & acceptance criteria

### S1 — Login (Must)
*As a User I want to log in with a username so that I can create and play Games.*
- **AC1.1** Given a valid new username, when I `POST /auth/login`, then a User is created and I get a JWT.
- **AC1.2** Given an existing username (any case), when I log in, then I get a JWT for the same User.
- **AC1.3** Given a username that breaks R7, when I log in, then 400.
- **AC1.4** Given no or an invalid token, when I call any game endpoint, then 401.
- **AC1.5 (UI)** The Login screen has just a username input and a Log in button.
- **AC1.6 (UI)** After login, a default Game is created automatically: opponent `player2` (or `player1` if you are `player2`), logged in on the same page with their own JWT, Winning Score 100, and you start. The opponent and target can be changed through New Game (S2/S7).

### S2 — Create Game (Must)
*As a User I want to start a Game against an opponent with a chosen Winning Score so that we can play.*
- **AC2.1** Given I'm logged in, when I create a Game with opponent `bob` and no Winning Score, then the Game is in progress with Winning Score 100, all scores 0, and it's my Turn.
- **AC2.2** Given Winning Score 50, when I create a Game, then the Game's Winning Score is 50.
- **AC2.3** Given Winning Score 9, 1001, 50.5 or "abc", when I create a Game, then 400.
- **AC2.4** Given the opponent is myself (any case), when I create a Game, then 400.
- **AC2.5** Given the opponent has never logged in, when I create a Game, then that User is created and the Game starts.
- **AC2.6** Given no token, when I create a Game, then 401.

### S3 — Roll (Must)
*As a Player I want to Roll two dice so that I build up my Round Score.*
- **AC3.1** Given it's my Turn and the dice come up 3 & 4, when I Roll, then the response shows dice [3,4] and my Round Score goes up by 7; it is still my Turn.
- **AC3.2** Given it's not my Turn, when I Roll, then 403 and the state is unchanged.
- **AC3.3** Given I'm not a Player in this Game, when I Roll, then 403.
- **AC3.4** Given the Game is Won or Abandoned, when I Roll, then 409.

### S4 — Bust (Must)
*As a Player I want 6 & 6 to cost me my Round Score so that rolling carries risk.*
- **AC4.1** Given it's my Turn with Round Score 15, when I Roll 6 & 6, then my Round Score is 0, my Global Score is unchanged, the Turn passes, and the response has `bust: true`.
- **AC4.2** Given any roll other than 6 & 6, then `bust: false`.

### S5 — Hold (Must)
*As a Player I want to Hold so that my Round Score is safely banked.*
- **AC5.1** Given it's my Turn with Round Score 12 and Global Score 30 (Winning Score 100), when I Hold, then my Global Score is 42, my Round Score is 0, and the Turn passes.
- **AC5.2** Given it's not my Turn, when I Hold, then 403.
- **AC5.3** Given the Game is finished, when I Hold, then 409.
- **AC5.4** Given my Round Score is 0, when I Hold, then the Hold is allowed and the Turn passes.

### S6 — Win (Must)
*As a Player I want to win when I reach the Winning Score so that the Game ends.*
- **AC6.1** Given Global Score 90, Round Score 10 and Winning Score 100, when I Hold, then the Game is Won, I'm the winner, and no Turn passes.
- **AC6.2** Given my Global Score + Round Score ≥ Winning Score without a Hold, then the Game is still in progress (R2).
- **AC6.3** Given the Game is Won, when anyone Rolls or Holds, then 409.

### S7 — New Game / Abandon (Must)
*As a Player I want to start a New Game at any time so that I can restart.*
- **AC7.1** Given an in-progress Game, when either Player creates a New Game, then the old Game is Abandoned (no winner) and the new one is in progress.
- **AC7.2** Given an Abandoned Game, then neither Player's Win Count changed.
- **AC7.3** Given an Abandoned Game, when someone Rolls in it, then 409.

### S8 — Win Count (Should)
*As a User I want to see how many Games I've won so that I can track progress.*
- **AC8.1** Given a Game is Won by `alice`, then `alice`'s Win Count goes up by 1 and the loser's stays the same.
- **AC8.2** Given the game state, then each Player's Win Count is included in it.

### S9 — Bust lock feedback (Should)
*As a Player I want a clear Bust message with actions briefly locked so that I notice what happened.*
- **AC9.1** Given a Roll response with `bust: true`, then the UI shows a "6 & 6 — Bust!" message and disables Roll/Hold for ~1.5s.
- **AC9.2** The UI decides nothing about the rules: the Turn change comes from the API state.

### S10 — Bot opponent (Should)
*As a User I want to play against a Bot that behaves like a real opponent so that I can play alone.*
- **AC10.1** Given I create a Game with opponent "Bot", then the Game is in progress against the User `bot` and it's my Turn.
- **AC10.2** Given I log in as `bot` (any case), then 400.
- **AC10.3** Given a Game vs the Bot, when I Hold (without Winning) or Bust, then the response's state is my Turn again and it includes `botSteps`: the ordered Rolls (dice, bust) and the final Hold the Bot made.
- **AC10.4** Given seeded dice, the Bot Rolls until its Round Score ≥ 20 or Holding would Win, then Holds; on 6 & 6 it Busts and its Turn ends (R12).
- **AC10.5** Given the Bot Wins, then the Game is Won by `bot` and `bot`'s Win Count goes up by 1.
- **AC10.6** Given the Bot is in a Game with `alice`, when `carol` starts a Game vs the Bot, then `alice`'s Game is not Abandoned (R11).
- **AC10.7 (UI)** The Bot Turn is replayed step by step: a "Bot is thinking…" indicator (600–1200 ms, randomised) before each step, the dice animation, the Round Score going up, and a Hold/Bust banner.
- **AC10.8 (UI)** During the replay Roll/Hold are disabled; Space or a click skips to the end; New Game stays available.
- **AC10.9 (UI)** If the Bot Wins, the win overlay appears only after the replay finishes.

## Scope (MoSCoW, ~2h)

- **Must:** S1–S7 with all rules enforced in the API, the error contract, domain unit tests, and API e2e tests.
- **Should:** S8 Win Count, S9 Bust lock, S10 Bot opponent.
- **Could:** saving data via local storage / SQLite through the repository port; a list of past Games.
- **Won't:** Bot difficulty levels or adaptive strategies, sound/music, passwords/refresh tokens, live sync across browsers.

## Out of scope
Passwords, multiple concurrent Games per User, spectators, leaderboards, live updates, mobile-specific layout.
