# 1. HLD — System context and containers

## Context

Two people share one browser (hot-seat), or one person plays the Bot. Everything runs locally; there is no external service.

```mermaid
flowchart LR
  P1([Human Player A]) --> WEB
  P2([Human Player B<br/>same browser]) --> WEB
  WEB["Web app<br/>Vite + React SPA<br/>:5173"] -- "HTTP JSON + Bearer JWT<br/>/api/* proxied" --> API["API<br/>NestJS<br/>:3001"]
  API --> MEM[("In-memory<br/>repositories")]
  API -. "plays its Turns" .-> BOT([Bot<br/>system User 'bot'])
```

## Containers

```mermaid
flowchart TB
  subgraph Browser
    SPA["apps/web<br/>React 18 + TanStack Query"]
  end
  subgraph Node["Node.js process"]
    API["apps/api<br/>NestJS REST"]
    REPO[("InMemoryGameRepository<br/>InMemoryUserRepository")]
    API --> REPO
  end
  CT["packages/contracts<br/>shared DTO types + constants"]
  SPA -- "fetch /api/... (Vite dev proxy strips /api)" --> API
  CT -. "imported by" .-> SPA
  CT -. "imported by" .-> API
```

| Container | Tech | Holds state? |
|---|---|---|
| `apps/web` | Vite, React, TanStack Query | Seats (tokens) in React context; server state in the Query cache. Lost on reload by design. |
| `apps/api` | NestJS, Passport JWT, class-validator | All game state, in memory. Lost on API restart. |
| `packages/contracts` | TypeScript types only | No. It is the single REST contract both sides compile against. |

## Infrastructure today vs a production version

Today: `npm run dev` starts both apps with `concurrently`. There is no database, container or cloud setup (by choice, see the scope table in the README).

```mermaid
flowchart LR
  subgraph Today["Today (local)"]
    direction LR
    V[Vite dev server :5173] -- proxy /api --> N[Nest :3001] --> M[(Memory)]
  end
  subgraph Prod["Production version (not built)"]
    direction LR
    CDN[Static hosting / CDN<br/>built SPA] --> LB[Load balancer] --> A1[API instance]
    LB --> A2[API instance]
    A1 --> DB[(Postgres)]
    A2 --> DB
  end
```

Only the infrastructure layer would change for production: a `PostgresGameRepository` / `PostgresUserRepository` implementing the same ports. Multiple API instances need shared storage, because state is in memory today. Next: [02-components.md](02-components.md).
