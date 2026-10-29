import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { ApiErrorDto, GameStateDto, LoginResponse } from '@dice/contracts';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { DICE_ROLLER } from '../src/games/domain/dice-roller';
import { FakeDiceRoller } from './fake-dice-roller';

describe('Games (e2e)', () => {
  let app: INestApplication;
  let dice: FakeDiceRoller;
  let alice: LoginResponse;
  let bob: LoginResponse;

  const http = () => request(app.getHttpServer());
  const auth = (who: LoginResponse) => ({ Authorization: `Bearer ${who.accessToken}` });
  const login = async (username: string) =>
    (await http().post('/auth/login').send({ username })).body as LoginResponse;
  const create = (who: LoginResponse, body: object) =>
    http().post('/games').set(auth(who)).send(body);
  const newGame = async (body: object = { opponentUsername: 'bob' }) =>
    (await create(alice, body)).body as GameStateDto;
  const act = (who: LoginResponse, id: string, action: 'roll' | 'hold') =>
    http().post(`/games/${id}/${action}`).set(auth(who));

  beforeEach(async () => {
    dice = new FakeDiceRoller();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(DICE_ROLLER)
      .useValue(dice)
      .compile();
    app = configureApp(moduleRef.createNestApplication());
    await app.init();
    alice = await login('alice');
    bob = await login('bob');
  });

  afterEach(() => app.close());

  describe('POST /games', () => {
    it('creates a Game to 100 with all scores 0 and my Turn (AC2.1)', async () => {
      const res = await create(alice, { opponentUsername: 'bob' });
      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        id: expect.any(String),
        status: 'IN_PROGRESS',
        winningScore: 100,
        players: [
          { userId: alice.user.id, username: 'alice', globalScore: 0, roundScore: 0, winCount: 0 },
          { userId: bob.user.id, username: 'bob', globalScore: 0, roundScore: 0, winCount: 0 },
        ],
        currentPlayerId: alice.user.id,
        winnerId: null,
        lastRoll: null,
        botSteps: [],
      });
    });

    it('uses the given Winning Score (AC2.2)', async () => {
      expect((await newGame({ opponentUsername: 'bob', winningScore: 50 })).winningScore).toBe(50);
    });

    it.each([9, 1001, 50.5, 'abc'])('rejects Winning Score %p with 400 (AC2.3)', async (score) => {
      const res = await create(alice, { opponentUsername: 'bob', winningScore: score });
      expect(res.status).toBe(400);
    });

    it('rejects playing yourself in any case with 400 (AC2.4)', async () => {
      const res = await create(alice, { opponentUsername: 'ALICE' });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        statusCode: 400,
        error: 'Bad Request',
        message: 'You cannot play against yourself',
      } satisfies ApiErrorDto);
    });

    it('creates an opponent who never logged in (AC2.5)', async () => {
      const game = await newGame({ opponentUsername: 'Carol' });
      expect(game.players[1].username).toBe('carol');
      expect(game.status).toBe('IN_PROGRESS');
    });

    it('requires a token: 401 with ApiErrorDto shape (AC2.6, AC1.4)', async () => {
      const res = await http().post('/games').send({ opponentUsername: 'bob' });
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ statusCode: 401, error: 'Unauthorized', message: 'Unauthorized' });
    });
  });

  describe('GET /games/:id', () => {
    it('returns the state to a Player', async () => {
      const game = await newGame();
      const res = await http().get(`/games/${game.id}`).set(auth(bob));
      expect(res.status).toBe(200);
      expect(res.body).toEqual(game);
    });

    it('403 for a non-Player, 404 for an unknown id', async () => {
      const game = await newGame();
      const carol = await login('carol');
      expect((await http().get(`/games/${game.id}`).set(auth(carol))).status).toBe(403);
      expect((await http().get('/games/nope').set(auth(alice))).status).toBe(404);
    });
  });

  describe('roll', () => {
    it('adds the dice to my Round Score and keeps my Turn (AC3.1, AC4.2)', async () => {
      const game = await newGame();
      dice.push([3, 4]);
      const res = await act(alice, game.id, 'roll');
      expect(res.status).toBe(200);
      const state = res.body as GameStateDto;
      expect(state.lastRoll).toEqual({ dice: [3, 4], bust: false });
      expect(state.players[0].roundScore).toBe(7);
      expect(state.currentPlayerId).toBe(alice.user.id);
    });

    it('403 when not my Turn; state unchanged (AC3.2)', async () => {
      const game = await newGame();
      dice.push([3, 4]);
      expect((await act(bob, game.id, 'roll')).status).toBe(403);
      const after = (await http().get(`/games/${game.id}`).set(auth(alice))).body as GameStateDto;
      expect(after).toEqual(game);
    });

    it('403 for a non-Player (AC3.3)', async () => {
      const game = await newGame();
      dice.push([3, 4]);
      expect((await act(await login('carol'), game.id, 'roll')).status).toBe(403);
    });

    it('6 & 6 busts: Round Score lost, Turn passes, bust: true (AC4.1)', async () => {
      const game = await newGame();
      dice.push([5, 5], [6, 6]);
      await act(alice, game.id, 'roll');
      const state = (await act(alice, game.id, 'roll')).body as GameStateDto;
      expect(state.lastRoll).toEqual({ dice: [6, 6], bust: true });
      expect(state.players[0]).toMatchObject({ roundScore: 0, globalScore: 0 });
      expect(state.currentPlayerId).toBe(bob.user.id);
    });
  });

  describe('hold', () => {
    it('banks the Round Score and passes the Turn (AC5.1)', async () => {
      const game = await newGame();
      dice.push([5, 5]);
      await act(alice, game.id, 'roll');
      const state = (await act(alice, game.id, 'hold')).body as GameStateDto;
      expect(state.players[0]).toMatchObject({ globalScore: 10, roundScore: 0 });
      expect(state.currentPlayerId).toBe(bob.user.id);
    });

    it('403 when not my Turn (AC5.2)', async () => {
      const game = await newGame();
      expect((await act(bob, game.id, 'hold')).status).toBe(403);
    });

    it('allows Hold with Round Score 0 (AC5.4)', async () => {
      const game = await newGame();
      const state = (await act(alice, game.id, 'hold')).body as GameStateDto;
      expect(state.currentPlayerId).toBe(bob.user.id);
    });
  });

  describe('win', () => {
    it('Hold reaching the Winning Score wins and bumps the Win Count (AC6.1, AC8.1, AC8.2)', async () => {
      const game = await newGame({ opponentUsername: 'bob', winningScore: 10 });
      dice.push([5, 5]);
      await act(alice, game.id, 'roll');
      const state = (await act(alice, game.id, 'hold')).body as GameStateDto;
      expect(state.status).toBe('WON');
      expect(state.winnerId).toBe(alice.user.id);
      expect(state.currentPlayerId).toBeNull();
      expect(state.players.map((p) => p.winCount)).toEqual([1, 0]);
      const me = await http().get('/users/me').set(auth(alice));
      expect(me.body.winCount).toBe(1);
    });

    it('409 with ApiErrorDto shape on Roll or Hold after a Win (AC3.4, AC5.3, AC6.3)', async () => {
      const game = await newGame({ opponentUsername: 'bob', winningScore: 10 });
      dice.push([5, 5], [1, 1]);
      await act(alice, game.id, 'roll');
      await act(alice, game.id, 'hold');
      const roll = await act(alice, game.id, 'roll');
      expect(roll.status).toBe(409);
      expect(roll.body).toEqual({
        statusCode: 409,
        error: 'Conflict',
        message: 'The Game is not in progress',
      });
      expect((await act(bob, game.id, 'hold')).status).toBe(409);
    });
  });

  describe('new game', () => {
    it('abandons the previous Game with no winner and no Win Count change (AC7.1–AC7.3)', async () => {
      const old = await newGame();
      const fresh = (await create(bob, { opponentUsername: 'alice' })).body as GameStateDto;
      expect(fresh.status).toBe('IN_PROGRESS');
      expect(fresh.currentPlayerId).toBe(bob.user.id);

      const oldState = (await http().get(`/games/${old.id}`).set(auth(alice))).body as GameStateDto;
      expect(oldState.status).toBe('ABANDONED');
      expect(oldState.winnerId).toBeNull();
      expect(oldState.players.map((p) => p.winCount)).toEqual([0, 0]);

      dice.push([1, 2]);
      expect((await act(alice, old.id, 'roll')).status).toBe(409);
    });
  });

  describe('vs Bot', () => {
    const botGame = async (winningScore?: number) =>
      (await create(alice, { opponentUsername: 'Bot', winningScore })).body as GameStateDto;

    it('starts against the system User bot with my Turn (AC10.1)', async () => {
      const game = await botGame();
      expect(game.status).toBe('IN_PROGRESS');
      expect(game.players[1].username).toBe('bot');
      expect(game.currentPlayerId).toBe(alice.user.id);
      expect(game.botSteps).toEqual([]);
    });

    it('rejects logging in as bot in any case (AC10.2)', async () => {
      const res = await http().post('/auth/login').send({ username: 'BoT' });
      expect(res.status).toBe(400);
    });

    it('plays the Bot Turn inside my Hold and returns its steps (AC10.3, AC10.4)', async () => {
      const game = await botGame();
      dice.push([2, 3], [6, 5], [6, 4], [1, 2]);
      await act(alice, game.id, 'roll');
      const res = await act(alice, game.id, 'hold');

      const state = res.body as GameStateDto;
      expect(res.status).toBe(200);
      expect(state.currentPlayerId).toBe(alice.user.id);
      expect(state.players.map((p) => p.globalScore)).toEqual([5, 21]);
      expect(state.botSteps).toEqual([
        { kind: 'ROLL', dice: [6, 5], bust: false, roundScore: 11, globalScore: 0 },
        { kind: 'ROLL', dice: [6, 4], bust: false, roundScore: 21, globalScore: 0 },
        { kind: 'HOLD', won: false, roundScore: 0, globalScore: 21 },
      ]);
    });

    it('plays the Bot Turn after my Bust, still reporting my Bust (AC10.3, AC4.1)', async () => {
      const game = await botGame();
      dice.push([6, 6], [3, 4], [6, 6]);
      const state = (await act(alice, game.id, 'roll')).body as GameStateDto;
      expect(state.lastRoll).toEqual({ dice: [6, 6], bust: true });
      expect(state.botSteps).toEqual([
        { kind: 'ROLL', dice: [3, 4], bust: false, roundScore: 7, globalScore: 0 },
        { kind: 'ROLL', dice: [6, 6], bust: true, roundScore: 0, globalScore: 0 },
      ]);
      expect(state.currentPlayerId).toBe(alice.user.id);
    });

    it('a Bot Win ends the Game and bumps its Win Count (AC10.5)', async () => {
      const game = await botGame(10);
      dice.push([5, 6]);
      const state = (await act(alice, game.id, 'hold')).body as GameStateDto;
      expect(state.status).toBe('WON');
      expect(state.winnerId).toBe(state.players[1].userId);
      expect(state.players[1].winCount).toBe(1);
    });

    it('the Bot may be in many Games at once (AC10.6)', async () => {
      const first = await botGame();
      await create(bob, { opponentUsername: 'bot' });
      const old = (await http().get(`/games/${first.id}`).set(auth(alice))).body as GameStateDto;
      expect(old.status).toBe('IN_PROGRESS');
    });
  });
});
