# 2. Components — modules and layers

## API: NestJS modules

```mermaid
flowchart LR
  APP[AppModule<br/>ConfigModule: JWT_SECRET] --> AUTH[AuthModule]
  APP --> USERS[UsersModule]
  APP --> GAMES[GamesModule]
  AUTH --> USERS
  GAMES --> USERS
  GAMES -. "uses JwtAuthGuard class" .-> AUTH
```

`configureApp()` (shared by `main.ts` and the e2e tests) installs a global `ValidationPipe` and the global `DomainExceptionFilter`.

## API: DDD layers inside each module

Dependency rule: `presentation → application → domain`. `infrastructure` implements domain ports. `domain/` imports nothing from Nest.

```mermaid
flowchart TB
  subgraph presentation
    AC[AuthController<br/>POST /auth/login]
    UC[UsersController<br/>GET /users/me]
    GC[GamesController<br/>POST /games · GET /games/:id<br/>POST /games/:id/roll · /hold]
    DTO[toGameStateDto · toUserDto<br/>LoginDto · CreateGameDto]
  end
  subgraph application
    AS[AuthService]
    US[UsersService]
    GS[GamesService]
  end
  subgraph domain
    G[Game · Player]
    U[User · Username]
    BP[playBotTurn]
    BS{{BotStrategy port}}
    DR{{DiceRoller port}}
    GR{{GameRepository port}}
    UR{{UserRepository port}}
    ERR[DomainError subclasses]
  end
  subgraph infrastructure
    JWT[JwtStrategy · JwtAuthGuard]
    RDR[RandomDiceRoller]
    IGR[InMemoryGameRepository]
    IUR[InMemoryUserRepository]
    HAT[HoldAtTwentyStrategy]
  end
  AC --> AS
  UC --> US
  GC --> GS
  AS --> US
  GS --> US
  GS --> G
  GS --> BP
  BP --> BS
  BP --> DR
  GS --> GR
  US --> UR
  US --> U
  RDR -. implements .-> DR
  IGR -. implements .-> GR
  IUR -. implements .-> UR
  HAT -. implements .-> BS
  GC -. guarded by .-> JWT
```

`HoldAtTwentyStrategy` lives in `domain/bot-strategy.ts` (it is pure rules); it sits in the infrastructure box only as the bound implementation.

## Web: React structure

Presentational components render only `GameStateDto`; the UI makes no rule decisions.

```mermaid
flowchart TB
  APP[App] --> SP[SeatProvider<br/>session: seats + gameId]
  SP --> QP[QueryProvider<br/>401 → logout]
  QP --> SCR{session?}
  SCR -- no --> LC[LoginContainer] --> USS[useStartSession] --> SG[startGame]
  SCR -- yes --> GCt[GameContainer]
  GCt --> UG[useGame<br/>query + roll/hold/newGame mutations]
  GCt --> UBR[useBotReplay<br/>botReplayTimeline]
  GCt --> UBL[useBustLock<br/>1.5s lock]
  GCt --> USo[useSound<br/>soundFor + SoundPlayer port]
  GCt --> UTK[useTurnKeys<br/>R / H / Space]
  UG --> CL[apiClient<br/>fetch /api]
  SG --> CL
  GCt --> UI[TopBar · PlayerCard · DiceTable<br/>TurnActions · NewGameDialog · WinOverlay · LiveRegion]
  USo --> WA[WebAudio player<br/>or silent player]
```

| Concern | Where | Note |
|---|---|---|
| Which token acts | `seatFor(session, currentPlayerId)` in `useGame` | Each seat has its own JWT; the API decides whose Turn it is. |
| Server state | TanStack Query cache `['game', id]` | Every mutation response replaces it (`setQueryData`); no refetch. |
| Bot Turn | `useBotReplay` | Replays `botSteps` as frames, then `refresh()` ([ADR 0003](../adr/0003-bot-turn-decided-on-server-replayed-on-client.md)). |
| Polish | `useBustLock`, `useSound`, `announce` | Presentational only; the API never knows about them. |

Next: [03-flows.md](03-flows.md).
