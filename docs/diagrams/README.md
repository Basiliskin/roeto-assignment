# Diagrams — Dice Game

System diagrams from high level to low level, as Mermaid (GitHub renders them). Each file goes one level deeper than the previous one.

| # | File | Level | Answers |
|---|---|---|---|
| 1 | [01-hld.md](01-hld.md) | HLD | What runs where, and how the pieces talk |
| 2 | [02-components.md](02-components.md) | Mid | NestJS modules, DDD layers, React structure |
| 3 | [03-flows.md](03-flows.md) | LLD | Request flows: login, New Game, Roll, Hold, Bot Turn, errors |
| 4 | [04-domain-model.md](04-domain-model.md) | LLD | Classes, ports, Game and Turn state machines |

**Interactive version:** open [index.html](index.html) in a browser. It has tabs per level, click-through from a box to its detail diagram, and zoom. It is generated from these files, so edit the `.md` files and then run:

```bash
npm run docs:diagrams
```

The written spec is [architecture.md](../architecture.md). Decisions are in [ADRs](../adr/), terms in the [glossary](../../GLOSSARY.md).
