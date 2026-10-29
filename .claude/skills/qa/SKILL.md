---
name: qa
description: QA and final-review step for the dice-game assignment — checks each PDF rule against a test, runs all suites and a manual smoke run, audits SOLID/KISS/DRY/DDD and NestJS/React practices, and prepares the repo for public release. Use after the last /developer slice.
---

# /qa

Follow `.claude/skills/_shared/PROTOCOL.md` throughout.

## Steps
1. **Checklist**: in `docs/qa-report.md`, a short list of each PDF rule → covering test (or "manual"). Mark gaps. No exhaustive matrix.
2. **Run** typecheck, lint, unit and e2e suites; paste real results. Start the app and smoke-test the full flow (two logins → play to Win → New Game → Bust lock → Win Count), plus abuse cases: roll with no token, roll on opponent's Turn, hold on a finished Game.
3. **Audit** the code: game logic leaking into `apps/web`; framework imports in domain; fat controllers; duplicated types outside `packages/contracts`; SRP/DIP violations; dead code. Cite `file:line`.
4. Propose fixes as options (fix now / defer to README "With more time" / ignore) with a recommendation; **wait** for the user, then apply chosen fixes (or hand back to `/developer` for larger ones).
5. **Release readiness** for the public repo: README stays short and must have accurate **Assumptions**, **Trade-offs** and **With more time** sections plus run instructions, `.env.example`, no secrets committed, `.gitignore`, a clean `npm install && npm run dev` from scratch.
6. Log in SESSION-LOG.

## Hand off
If gaps remain:
➡️ Next step: `/developer`
Suggested prompt: `/developer fix <gap> from docs/qa-report.md`

Otherwise:
✅ Ready to publish. Suggested prompt: `commit everything and push to a new public GitHub repo`
