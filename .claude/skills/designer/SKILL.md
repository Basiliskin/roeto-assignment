---
name: designer
description: UI/UX designer step for the dice-game assignment — builds 2 clickable, self-contained HTML prototypes with mocked state, lets the user pick or mix, then writes docs/design.md for the frontend slices. Use after /architect, or when the UI needs rethinking.
---

# /designer

Follow `.claude/skills/_shared/PROTOCOL.md` throughout.

## Goal
Let the user *feel* the UX before code exists, then lock it into `docs/design.md`.

## Steps
1. Read `docs/requirements.md`, `docs/architecture.md` (state DTO shape), `GLOSSARY.md`, and study the inspirational demo `docs/reference/demo.png` (https://www.youtube.com/watch?v=K4g39bWhZpo): split screen, faded inactive side + red dot on active Player, large Global Score, red CURRENT box, centre NEW GAME / ROLL DICE / HOLD, Winning Score input. **How closely to follow it is open question Q20** — propose it as a decision.
2. Build **2 throwaway prototypes** in `prototypes/variant-a.html`, `-b.html`. Each is one self-contained file (inline CSS/JS, no build), driven by a mocked `GameState` matching the contracts. Each must be clickable through: two seat logins → Roll / Hold → Turn switch → Bust (6&6) with actions locked ~1.5s + message/animation → Win screen → New Game.
   Make the variants genuinely different, e.g.:
   - **A — Split screen** (inspired by the demo): left/right Player panels, active side highlighted, centre dice + controls.
   - **B — Table**: centred dice table, compact Player cards top/bottom, controls follow the active Player.
3. Every variant must satisfy the **UX checklist**: active Player unmistakable (colour + label + aria-live); disabled buttons say *why*; last roll result and its effect on Round Score visible; Bust and Win clearly announced; keyboard operable (R = roll, H = hold); contrast AA; works at 360px width.
4. Tell the user how to open them (`open prototypes/variant-a.html`) and propose the choice (options + recommendation). The user may pick, mix ("A layout with B controls"), or describe their own — iterate until they confirm.
5. Write `docs/design.md`: chosen layout (screenshot-free description + ASCII sketch), React **component tree** (containers vs presentational), design tokens (colours, spacing, radius, font), interaction rules (Bust lock duration, animations, keyboard), accessibility notes. Log in SESSION-LOG.

Prototypes contain **mock logic only** and are never imported by `apps/web`.

## Hand off
➡️ Next step: `/developer`
Suggested prompt: `/developer S0 scaffold the monorepo per docs/architecture.md`
