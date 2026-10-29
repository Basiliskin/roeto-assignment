import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiClient } from './client';

const respond = (status: number, body: unknown) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );

describe('apiClient', () => {
  afterEach(() => vi.restoreAllMocks());

  it('POSTs JSON with the bearer token under /api', async () => {
    const fetchSpy = respond(201, { id: 'g1' });
    await apiClient.createGame('tok', { opponentUsername: 'bob' });
    expect(fetchSpy).toHaveBeenCalledWith('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer tok' },
      body: JSON.stringify({ opponentUsername: 'bob' }),
    });
  });

  it('throws ApiError carrying the ApiErrorDto on non-2xx', async () => {
    respond(409, { statusCode: 409, error: 'Conflict', message: 'The Game is not in progress' });
    const error = await apiClient.roll('tok', 'g1').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 409, message: 'The Game is not in progress' });
  });

  it('joins array validation messages', async () => {
    respond(400, { statusCode: 400, error: 'Bad Request', message: ['a', 'b'] });
    await expect(apiClient.login({ username: 'x' })).rejects.toThrow('a; b');
  });
});
