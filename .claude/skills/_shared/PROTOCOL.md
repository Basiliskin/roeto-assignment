# Skill Protocol (shared by product, architect, designer, developer, qa)

Every skill in this repo follows these rules. Read this file before acting.

## 1. Ground yourself first
- Read `docs/requirements.md` (written by `/product` from `roeto-home-assignment .pdf`), `GLOSSARY.md`, `docs/adr/`, `docs/ai-log/SESSION-LOG.md` (settled decisions), and the outputs of earlier skills.
- Use Glossary terms exactly (User, Player, Game, Turn, Roll, Bust, Hold, Round Score, Global Score, Winning Score, Win, Abandon, Win Count). If a new term is needed, propose it and add it to `GLOSSARY.md` once the user agrees.

## 2. Propose, never decide
- For every non-trivial decision, present **2–3 options**, each with trade-offs (KISS / SOLID / DRY / DDD / time cost), and mark one `(Recommended)`.
- Format:
  ```
  ❓ D<n> — <decision title>
  (a) … (Recommended)
  (b) …
  (c) …
  ➡️ why the recommendation
  ```
- Max **~3 decisions per round**; anything smaller becomes a stated default recorded in the README.
- Ask all independent decisions in one round. **Stop and wait.** The user picks a letter, mixes options, or writes their own. Never proceed on an unanswered decision.

## 3. Record everything
Append to `docs/ai-log/SESSION-LOG.md` after every user answer (prompts are also captured automatically by the hook in `docs/ai-log/PROMPTS.md`):

```
## <YYYY-MM-DD HH:MM> : <skill> — <step>

**User input:**
> <verbatim>

**Options offered:** D1 (a/b/c) …
**Decision:** …
**Artifacts:** files created/changed
```

**README**: add your assumptions, trade-offs and "with more time" items to `README.md` as you go (one line each). Keep it short — reviewers value reasoning, not perfection.

Hard-to-reverse, surprising, real trade-off decisions → offer an ADR in `docs/adr/NNNN-title.md`.

## 4. Engineering bar
- SOLID, KISS, DRY, DDD. YAGNI beats cleverness — the budget is ~2 hours total.
- All game rules live in the API domain layer. The frontend never computes scores, turns or wins.
- NestJS: feature modules, thin controllers, DTOs validated with `class-validator`, guards for auth, domain free of framework imports.
- React: function components + hooks, server state via a single API client, presentational vs container split, no game logic.

## 5. Hand off
End every run with:

```
✅ Done: <what was produced>

➡️ Next step: /<next-skill>
Prompt to paste:
/<next-skill> <ready-to-run prompt with concrete context>
```

Chain: `/product` → `/architect` → `/designer` → `/developer <slice>` (repeat per slice) → `/qa`.
Log the suggested next step in SESSION-LOG too.
