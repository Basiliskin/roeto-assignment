import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { LoginResponse } from '@dice/contracts';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleRef.createNestApplication());
    await app.init();
  });

  afterEach(() => app.close());

  const login = (username: unknown) =>
    request(app.getHttpServer()).post('/auth/login').send({ username });

  it('creates a User and returns a JWT (AC1.1)', async () => {
    const res = await login('Alice');
    expect(res.status).toBe(201);
    const body = res.body as LoginResponse;
    expect(body.accessToken).toEqual(expect.any(String));
    expect(body.user).toEqual({ id: expect.any(String), username: 'alice', winCount: 0 });
  });

  it('returns the same User for an existing username in any case (AC1.2)', async () => {
    const first = (await login('alice')).body as LoginResponse;
    const second = (await login('  ALICE ')).body as LoginResponse;
    expect(second.user.id).toBe(first.user.id);
  });

  it.each(['ab', 'a'.repeat(21), 'bad name', 'bad-name', '', 42, undefined])(
    'rejects username %p with 400 (AC1.3)',
    async (username) => {
      const res = await login(username);
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ statusCode: 400, error: 'Bad Request' });
    },
  );

  it('GET /users/me returns the caller', async () => {
    const { accessToken, user } = (await login('bob')).body as LoginResponse;
    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(user);
  });

  it.each([
    ['no token', undefined],
    ['an invalid token', 'Bearer not-a-jwt'],
  ])('GET /users/me with %s → 401 (AC1.4)', async (_label, header) => {
    const req = request(app.getHttpServer()).get('/users/me');
    if (header) req.set('Authorization', header);
    const res = await req;
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ statusCode: 401 });
  });
});
