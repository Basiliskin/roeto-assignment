# 3. LLD — Request flows

Every mutation returns the full `GameStateDto`; the web app replaces its cache with it. Names match the code.

## Login (and the default Game)

```mermaid
sequenceDiagram
  actor U as Player
  participant LC as LoginContainer
  participant SS as useStartSession / startGame
  participant API as AuthController → AuthService
  participant US as UsersService
  participant GS as GamesController → GamesService
  U->>LC: username
  LC->>SS: mutate(username)
  SS->>API: POST /auth/login {username}
  API->>API: Username.of() (bot is reserved → 400)
  API->>US: findOrCreate(username)
  US-->>API: User
  API-->>SS: {accessToken, user}
  Note over SS: default opponent: a human seat is logged in too (own JWT), or no seat for "bot"
  SS->>GS: POST /games {opponentUsername} (Bearer me)
  GS-->>SS: GameStateDto
  SS->>LC: setSession({seats, gameId}) → GameContainer renders
```

## New Game (abandons active Games)

```mermaid
sequenceDiagram
  participant W as useGame.newGame
  participant C as GamesController
  participant S as GamesService
  participant G as Game
  participant R as GameRepository
  W->>C: POST /games {opponentUsername, winningScore}
  C->>S: create(userId, opponent, winningScore)
  S->>S: users.findOrCreate(opponent)
  S->>G: Game.create() — SelfPlayError / InvalidWinningScoreError → 400
  S->>R: findActiveByUserId(creator) → abandon() + save
  alt opponent is not the Bot
    S->>R: findActiveByUserId(opponent) → abandon() + save
  end
  S->>R: save(new Game)
  S-->>C: GameView → toGameStateDto
  C-->>W: 201 GameStateDto
```

## Roll (including Bust)

```mermaid
sequenceDiagram
  actor P as Player
  participant GC as GameContainer
  participant UG as useGame.roll
  participant S as GamesService
  participant G as Game
  participant D as DiceRoller
  P->>GC: Roll button / R key
  GC->>UG: mutate() with seatFor(currentPlayerId).token
  UG->>S: POST /games/:id/roll
  S->>D: roll() → [d1, d2]
  S->>G: roll(userId, dice)
  G->>G: assertCanAct (403 / 409)
  alt 6 & 6
    G->>G: player.loseRound(), passTurn()
  else
    G->>G: player.addToRound(d1 + d2)
  end
  S->>S: saveAfterHumanTurn (may play Bot Turn, see below)
  S-->>UG: GameStateDto (lastRoll.bust)
  UG-->>GC: setQueryData
  GC->>GC: dice animation · bust → useBustLock 1.5s · sound · announce
```

## Hold → Win

```mermaid
sequenceDiagram
  participant S as GamesService
  participant G as Game
  participant US as UsersService
  participant R as GameRepository
  S->>G: hold(userId)
  G->>G: bankRound()
  alt globalScore ≥ winningScore
    G-->>S: {won: true} (status WON, winnerId set, no Turn pass)
    S->>US: recordWin(userId) → Win Count + 1
  else
    G-->>S: {won: false}, passTurn()
  end
  S->>R: save(game)
  Note right of S: web: WinOverlay + Win sound when winnerId appears
```

## Bot Turn — decided on the server, replayed on the client

See [ADR 0003](../adr/0003-bot-turn-decided-on-server-replayed-on-client.md).

```mermaid
sequenceDiagram
  participant GC as GameContainer
  participant S as GamesService
  participant BP as playBotTurn
  participant BS as BotStrategy (HoldAtTwenty)
  participant G as Game
  participant RP as useBotReplay
  GC->>S: POST hold (or roll that busts) — Turn passes to bot
  S->>BP: playBotTurn(game, botId, strategy, dice)
  loop while currentPlayerId === bot
    BP->>BS: decide({roundScore, globalScore, winningScore})
    alt ROLL
      BP->>G: roll(bot, dice) → step {ROLL, dice, bust}
    else HOLD
      BP->>G: hold(bot) → step {HOLD, won}
    end
  end
  S->>S: bot won? recordWin(bot) · save once
  S-->>GC: GameStateDto {botSteps[], lastRoll = human's roll}
  GC->>RP: start(before, after, delay = bust lock?)
  loop each step (botReplayTimeline)
    RP-->>GC: thinking frame 600–1200 ms
    RP-->>GC: step frame (dice, scores, sound, bust lock)
  end
  RP->>GC: done → refresh() → real state, WinOverlay if Bot won
```

Controls stay locked during the replay. Space or a click skips to the end. No requests are made while it plays.

## Error path

```mermaid
flowchart LR
  REQ[HTTP request] --> VP{ValidationPipe}
  VP -- bad DTO --> E400[400]
  VP --> GU{JwtAuthGuard}
  GU -- no/invalid token --> E401[401]
  GU --> SVC[Service + domain]
  SVC -- throws DomainError(code) --> F[DomainExceptionFilter<br/>STATUS_BY_CODE]
  F --> MAP["INVALID_* / SELF_PLAY / RESERVED_USERNAME → 400<br/>NOT_A_PLAYER / NOT_YOUR_TURN → 403<br/>GAME_NOT_FOUND → 404<br/>GAME_NOT_IN_PROGRESS → 409<br/>unknown → 500"]
  MAP --> BODY["ApiErrorDto {statusCode, error, message}"]
  BODY --> CL[apiClient throws ApiError]
  CL -- 401 --> LO[QueryProvider: logout → Login]
  CL -- other --> INL[shown inline under the board]
```

See [ADR 0002](../adr/0002-domain-errors-mapped-by-global-filter.md). Next: [04-domain-model.md](04-domain-model.md).
