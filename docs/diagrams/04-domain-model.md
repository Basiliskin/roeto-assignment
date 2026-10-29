# 4. LLD — Domain model

## Classes and ports

```mermaid
classDiagram
  class Game {
    <<aggregate root>>
    +id
    +players Player x2
    +winningScore 10..1000
    +status GameStatus
    +currentPlayerId
    +winnerId
    +lastRoll LastRoll
    +create(props)$ Game
    +roll(userId, dice) bust
    +hold(userId) won
    +abandon()
    +hasPlayer(userId)
    -assertCanAct(userId)
    -passTurn()
  }
  class Player {
    <<entity>>
    +userId
    +globalScore
    +roundScore
    +addToRound(points)
    +loseRound()
    +bankRound()
  }
  class User {
    <<aggregate root>>
    +id
    +username Username
    +winCount
    +recordWin()
  }
  class Username {
    <<value object>>
    +value lowercase
    +isBot
    +of(raw)$
    +equals(other)
  }
  class GameRepository {
    <<port>>
    findById(id)
    findActiveByUserId(userId)
    save(game)
  }
  class UserRepository {
    <<port>>
    findById(id)
    findByUsername(username)
    save(user)
  }
  class DiceRoller {
    <<port>>
    roll() Dice
  }
  class BotStrategy {
    <<port>>
    decide(view) ROLL or HOLD
  }
  class HoldAtTwentyStrategy
  class BotPlayer {
    <<domain service>>
    +playBotTurn(game, botId, strategy, dice) BotStep[]
  }
  Game "1" *-- "2" Player
  Player ..> User : userId
  User *-- Username
  BotStrategy <|.. HoldAtTwentyStrategy
  BotPlayer ..> Game
  BotPlayer ..> BotStrategy
  BotPlayer ..> DiceRoller
  GameRepository ..> Game
  UserRepository ..> User
```

Game methods return results and never do I/O. The application service saves the Game and records Wins.

## Game lifecycle

```mermaid
stateDiagram-v2
  [*] --> IN_PROGRESS: Game.create()
  IN_PROGRESS --> WON: hold() and globalScore ≥ winningScore
  IN_PROGRESS --> ABANDONED: abandon() (a Player starts a New Game)
  WON --> [*]
  ABANDONED --> [*]
```

## A Turn

```mermaid
stateDiagram-v2
  [*] --> Rolling: Turn starts, roundScore = 0
  Rolling --> Rolling: roll() not 6&6 / roundScore += d1 + d2
  Rolling --> Passed: roll() 6&6 / Bust, roundScore = 0
  Rolling --> Banked: hold() / globalScore += roundScore
  Banked --> Won: globalScore ≥ winningScore
  Banked --> Passed: otherwise
  Passed --> [*]: other Player's Turn
  Won --> [*]: Game WON
```

## Invariants (enforced in `Game`)

| # | Rule | Error → HTTP |
|---|---|---|
| 1 | Exactly 2 Players, distinct Users | `SelfPlayError` → 400 |
| 2 | Winning Score is an integer 10–1000 | `InvalidWinningScoreError` → 400 |
| 3 | Only a Player, and only the current one, may act | `NotAPlayerError` / `NotYourTurnError` → 403 |
| 4 | Roll and Hold need `IN_PROGRESS` | `GameNotInProgressError` → 409 |
| 5 | 6 & 6 loses the Round Score and passes the Turn | — |
| 6 | Hold banks; a Win ends the Game without passing the Turn | — |
| 7 | Abandon ends an active Game with no winner | — |
