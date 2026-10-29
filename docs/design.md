# Design — Dice Table

Chosen: **Variant B "Dice Table"**, restyled into a modern dark felt theme (`prototypes/variant-b.html`, mock logic only; never imported by `apps/web`). The demo (`docs/reference/demo.png`) was used for inspiration only.

## Screens

### 1. Login screen
Just a username and a Log in button, centred on the screen (card max 420px wide). This screen says nothing about Players.

```
┌──────────────────────────────────┐
│        [🎲] Dice Table           │
│ Roll as long as you dare. Hold…  │
├──────────────────────────────────┤
│ Username                         │
│ (A) [ alice              ]       │
│ 3–20 letters, digits or _        │
│ [           Log in           ]   │
└──────────────────────────────────┘
```

On submit, `apps/web`:
1. calls `POST /auth/login { username }`, which gives the logged-in User's JWT (seat 1);
2. creates a **default Game**. It logs in the default opponent `player2` (or `player1` if you are `player2`), which gives seat 2's JWT. Then it calls `POST /games { opponentUsername }` with your token, so the target is 100 and you start;
3. shows the Game screen.

**New game** sheet: *Opponent* (empty means the default `player2`) and *First to* (50 / 100 / 250 / Custom). It logs in the opponent if needed and creates the Game. If the opponent is you → inline error "You can't play against yourself".

### 2. Game screen
```
┌ [🎲] Dice Table   First to 100   [↻ New game] ┐
│ ┌ (P) player2 ─────────────── 34 ┐  idle, faded │
│ │ 🏆 0 wins · 66 to go   round +0 │              │
│ │ ████████░░░░░░░░░░              │              │
│ │ Waiting for alice…              │              │
│ └─────────────────────────────────┘              │
│ ╭──────── felt table ────────╮                   │
│ │      [⚃]  [⚄]              │                   │
│ │         +9                 │                   │
│ ╰────────────────────────────╯                   │
│ ┌ (A) alice  YOUR TURN ────── 42 ┐  glow ring    │
│ │ 🏆 1 win · 58 to go   round +9  │              │
│ │ ███████████▒▒▒░░░░░             │              │
│ │ [🎲 Roll  R]   [✋ Hold  H]      │              │
│ └─────────────────────────────────┘              │
```
- Player 1 is at the bottom, nearest the thumb; Player 2 is at the top.
- Roll and Hold appear **only on the active Player's card**, and they act with that seat's token.
- **New game** opens a confirm sheet: "The current game will be abandoned — no one gets a win" plus the "First to" options.
- **Win** shows a full-screen card ("alice wins!", score, total wins) with a **Play again** button that has focus. Play again starts a new Game with the same target.

## Component tree

```
App (QueryClientProvider, SeatProvider)
├─ LoginContainer              — login, then default Game vs player2; owns form state & errors
│   └─ LoginForm               — presentational: username field, submit
└─ GameContainer               — useGame(id): query + roll/hold/create mutations; bust lock timer
    ├─ TopBar                  — brand, target pill, onNewGame
    ├─ PlayerCard ×2           — avatar, name, badge, scores, ProgressBar, (Actions | Waiting)
    │   ├─ ProgressBar
    │   └─ TurnActions         — Roll / Hold buttons, disabled + reason
    ├─ DiceTable               — Die ×2, delta, BustOverlay
    ├─ NewGameDialog           — opponent field, WinningScorePicker, abandon warning
    ├─ WinOverlay
    └─ LiveRegion              — aria-live announcer
Shared presentational: Avatar, Die, WinningScorePicker, Button
```
Containers talk to the API through `useGame` and `SeatContext`. Presentational components only receive props from `GameStateDto` and callbacks. They make **no rule decisions**: scores, turns, bust and win all come from the DTO.

## Design tokens

| Token | Value | Use |
|---|---|---|
| `--bg-1` / `--bg-2` | `#0e3323` / `#061a11` | radial page background |
| `--surface` / `--surface-2` | `rgba(255,255,255,.06)` / `.10` | glass cards, hover |
| `--border` | `rgba(255,255,255,.12)` | card & input borders |
| `--text` / `--muted` | `#f3f6f4` / `#a9bcb2` | text (AA on bg) |
| `--gold` / `--gold-ink` | `#f7c948` / `#2b2100` | primary action, Player 1, round score |
| `--p2` | `#5ec8f2` | Player 2 accent |
| `--success` | `#4ade80` | banked progress |
| `--danger` | `#ff5d5d` | errors, bust |
| Table felt | `#1f6b45 → #134a30` | dice table |
| Radius | 8 / 12 / 20 / 28px | sm / control / card / table |
| Spacing | 16px base, 8–28px | |
| Font | Inter → system-ui | 800 numbers (tabular), 700 buttons |

## Interaction rules
- **Roll:** the dice do a 0.55s toss animation, with the second die 60ms behind. A "+N" figure pops up under them. The striped segment of the Round Score bar grows.
- **Hold:** banked points move into the green segment of the bar and the Turn passes, so the glow ring moves to the other card. Hold stays enabled when the Round Score is 0 (AC5.4).
- **Bust** (`lastRoll.bust`): a red overlay covers the table: "BUST! <name> rolled 6 & 6 — round lost". A countdown bar drains for **1500ms**. All actions and keys are locked until it finishes.
- **Keyboard:** **R** rolls and **H** holds, both for the active Player. Shortcuts are ignored while an input has focus or a dialog is open. Esc closes the New game sheet.
- **Disabled controls** always say why in a `title` (e.g. "Locked — bust!"). The other Player's card shows "Waiting for X…" instead of buttons.
- **Errors:** the API's `ApiErrorDto.message` is shown inline. A 401 sends you back to the Login screen.

## Accessibility
- The active Player is marked by a colour ring, a "YOUR TURN" text badge and the card's `aria-label` ("alice, your turn"), so it never relies on colour alone.
- An `aria-live="assertive"` region announces each roll ("rolled 3 and 4, plus 7"), each bust, hold and win.
- Dice use `role="img"` with the number as their label. Progress bars use `role="progressbar"` with value and max.
- The Win overlay and New game sheet are modal, and focus moves to their main button. `prefers-reduced-motion` turns off all animations.
- Contrast: `--text` and `--muted` on the dark background, and `--gold-ink` on `--gold`, all meet AA.
- The layout is one column and works at 360px wide; dice shrink to 64px below 420px.
