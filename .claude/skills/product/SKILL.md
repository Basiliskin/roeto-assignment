---
name: product
description: Product-owner step for the dice-game assignment — turns the PDF and settled decisions into user stories with testable acceptance criteria and a scope cut. Use first in the chain, or when requirements/scope need revisiting.
---

# /product

Follow `.claude/skills/_shared/PROTOCOL.md` throughout.

## Goal
Produce `docs/requirements.md`: the single source of truth for *what* we build.

## Steps
1. Read `roeto-home-assignment .pdf`, `GLOSSARY.md`, `docs/adr/`, and `docs/ai-log/SESSION-LOG.md`. Do not re-ask anything already decided there.
2. Draft user stories (`As a <User/Player> I want … so that …`) covering: login, create Game with opponent + Winning Score, Roll, Bust, Hold, Win, New Game (Abandon), Win Count, Bust lock feedback.
3. For each story write **Given/When/Then acceptance criteria** — these become the QA test cases. Include negative cases (unauthenticated → 401, wrong Turn → 403, action on finished Game → 409, invalid Winning Score → 400).
4. Use the inspirational demo (`docs/reference/demo.png`, https://www.youtube.com/watch?v=K4g39bWhZpo) as **reference only** — the PDF wins on conflicts. Propose decisions on anything still ambiguous (e.g., **where/when the Winning Score is set — the demo shows an always-visible input under HOLD; open question Q19 from grilling**, Winning Score bounds, can a User play against themselves, max username length) — options + recommendation, wait for user.
5. Propose a **MoSCoW scope cut** sized for ~2h; user confirms.
6. Write `docs/requirements.md` (stories, AC, scope, out-of-scope), keep the README **Scope — optional extras** table in sync (status + one-line reason for every extra, especially cuts), update GLOSSARY if needed, log in SESSION-LOG.

## Hand off
➡️ Next step: `/architect`
Suggested prompt: `/architect design modules, domain model, API contract and state DTO for docs/requirements.md`
