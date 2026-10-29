# AI Session Log

Every interaction with Claude Code: `datetime : skill — prompt / user input / outcome`.

---

## 2026-10-29 : grill-with-docs (grilling + domain-modeling) — Round 0

**User prompt:**
> /grill-with-docs @roeto-home-assignment .pdf - this is home assigment for Job position
> - Time: it should take around 2 hours.
> - typescript/react/nestjs
> - I need skills for this home assigment task - product/architect/developer/qa(what ever you think is needed to make this)
> - its important that all communications of skill with claude code be recorded - datetime : skill X - prompt - all user inputs
> - must follow SOLID/KISS/DRY/DDD and best practices for nestjs and react
> - the final result will be published to public repo
> - important - each skill must propose best suiutable sulutions and user will choose or write his own

**Claude:** Read the assignment PDF (2-player Pig-style dice game, rules + auth live in a NestJS API, React only displays state). Opened Round 1 of the design-tree questions.

## 2026-10-29 : grill-with-docs — Round 1 answers

**User input:**
> Q5 - do we need auth for this task ?
>  - agree to rest recomendations

**Decisions:** Q1 4 skills (product/architect/developer/qa) · Q2 hook + transcript · Q3 npm-workspaces monorepo (api/web/contracts) · Q4 two real accounts, turn-ownership enforced · Q6 in-memory behind repository port, SQLite optional · Q7 all six rule interpretations confirmed · Q8 extras 1 (win count) + 4 (bust lock), 2 if time.
**Claude:** Auth is mandatory per PDF (3 mentions); Q5 re-opened with lighter option. GLOSSARY.md created.

## 2026-10-29 : grill-with-docs — Round 2 answers

**User input:**
> agree to recomendations

**Decisions:** Q5′ username-only login → JWT + guard · Q9 split-screen, per-side token, wrong-turn → 403 · Q10 abandon = no winner, no Win Count · Q11 DiceRoller port injected · Q12 domain unit + API e2e (supertest) · Q13 developer skill proposes options, user picks, Claude writes code.
**Claude:** Wrote ADR 0001 (username-only auth). Frontier empty — asked for shared-understanding confirmation.

## 2026-10-29 : grill-with-docs — Addendum

**User input:**
> one more thing - at the end skill should suggest next skill + prompt to run

**Decision:** Every skill ends with a "Next step" block: the next skill to invoke + a ready-to-paste prompt (chain: product → architect → developer (per slice, repeats) → qa → done). Logged in SESSION-LOG too.

## 2026-10-29 : grill-with-docs — Q14 designer skill

**User input:**
> what about designer skill ?
> yes - it should propose prototypes - best for UI/UX and user expirience

**Decision:** Add `/designer` between architect and developer; it proposes UI/UX prototypes, user picks, result written to docs/design.md. Chain: product → architect → designer → developer… → qa.

## 2026-10-29 : grill-with-docs — Q15 prototypes

**User input:**
> agree

**Decision:** Designer builds 2–3 clickable self-contained HTML prototypes (prototypes/variant-*.html) with mocked state; user picks/mixes; result → docs/design.md. Grilling complete — scaffolding skills + hook.

**Artifacts:** `.claude/settings.json` + `.claude/hooks/log-prompt.mjs` (UserPromptSubmit → docs/ai-log/PROMPTS.md) · `.claude/skills/_shared/PROTOCOL.md` · skills `product`, `architect`, `designer`, `developer`, `qa` · `GLOSSARY.md` · `docs/adr/0001-username-only-authentication.md`.
**Next step suggested:** `/product turn roeto-home-assignment .pdf into user stories, acceptance criteria and a 2h scope cut`

## 2026-10-29 : grill-with-docs — Q16/Q17 reviewer expectations

**User input:**
> is this setup follow these "We're not looking for perfection. We care about how you think, how you structure code, and the trade-offs you choose. Add a short README with your assumptions and anything you'd do differently with more time." ?
> agree

**Decisions:** Q16 README skeleton now (Assumptions / Trade-offs / With more time), every skill appends as it goes · Q17 slim process: designer 2 prototypes, qa checklist instead of matrix, ≤3 decisions per round.
**Artifacts:** README.md, PROTOCOL.md, designer/architect/qa SKILL.md updated.

## 2026-10-29 : grill-with-docs — README scope

**User input:**
> I dont see the cutted features , AI player, cut reason in readme.md

**Decision:** Added README "Scope — optional extras" table (In / If time / Cut + reason per extra); AI opponent + sound listed as cut and under "With more time". /product now owns keeping that table in sync.
**Artifacts:** README.md, .claude/skills/product/SKILL.md

## 2026-10-29 : grill-with-docs — Demo comparison (Q18–Q20)

**User input:**
> does your assumptions based on this demo [screenshot] https://www.youtube.com/watch?v=K4g39bWhZpo
> Q18 - what you mean ?
> (a): only 6&6

**Claude:** Assumptions were PDF-only (video not viewable). Raised Q18 bust rule, Q19 winning-score input placement, Q20 UI fidelity to demo.
**Decision:** Q18 (a) only 6&6 busts; README assumption notes the demo/classic-Pig 1-rule divergence. Q19, Q20 pending.

**User input:**
> Q19/Q20 - it will be desided bu product skill and design skill
>  - but may demo should used for reference and inspiration

**Decision:** Q19 deferred to /product, Q20 deferred to /designer. Demo saved to docs/reference/demo.png and referenced (inspiration only; PDF wins on conflicts) in product + designer skills.

## 2026-10-29 : product — decisions D1–D3

**User input:**
> agree to recomendations

**Options offered:** D1 Winning Score placement (a form on New Game / b always-visible input / c editable until first roll) · D2 bounds (a 10–1000, opponent ≠ self, auto-create / b any positive, self allowed / c opponent must exist) · D3 MoSCoW (a Must S1–S7, Should S8–S9, Could persistence / b extras in Must / c tighter)
**Decision:** D1 (a), D2 (a), D3 (a). Defaults: username 3–20 `[a-zA-Z0-9_]` case-insensitive; one active Game per User; either Player can start a New Game; Bust lock ~1.5s UI-only.
**Artifacts:** docs/requirements.md (new), README.md (assumptions, scope table), GLOSSARY.md (Winning Score).
**Next step suggested:** `/architect design modules, domain model, API contract and state DTO for docs/requirements.md`

## 2026-10-29 : architect — decisions D1–D3

**User input:**
> agree to recomendatinos

**Options offered:** D1 domain model (a Game aggregate + Win Count on User, synchronous / b Stats read-model via events / c separate Turn entity) · D2 layering & errors (a domain/application/infrastructure/presentation per module + global filter / b CQRS handlers / c flat Nest, HttpExceptions) · D3 API & frontend data (a full GameStateDto + TanStack Query + SeatContext / b useReducer + fetch / c delta responses)
**Decision:** D1 (a), D2 (a), D3 (a). Defaults: @nestjs/config with JWT_SECRET, global ValidationPipe, CORS for Vite, GET game restricted to its Players, slices S0–S6.
**Artifacts:** docs/architecture.md, packages/contracts/{package.json,src/auth.ts,game.ts,error.ts,index.ts}, docs/adr/0002-domain-errors-mapped-by-global-filter.md, README.md (Architecture, Trade-offs).
**Next step suggested:** `/designer build 2 clickable HTML prototypes for the game screen per docs/requirements.md and docs/architecture.md`
