import type {
  ApiErrorDto,
  CreateGameRequest,
  GameStateDto,
  LoginRequest,
  LoginResponse,
  UserDto,
} from '@dice/contracts';

/** Thrown for any non-2xx response; `message` is the API's message, ready to show inline. */
export class ApiError extends Error {
  readonly status: number;

  constructor(dto: ApiErrorDto) {
    super(Array.isArray(dto.message) ? dto.message.join('; ') : dto.message);
    this.status = dto.statusCode;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST';
  token?: string;
  body?: unknown;
}

async function request<T>(
  path: string,
  { method = 'GET', token, body }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      (json as ApiErrorDto | null) ?? {
        statusCode: res.status,
        error: res.statusText,
        message: res.statusText,
      },
    );
  }
  return json as T;
}

export const apiClient = {
  login: (body: LoginRequest) => request<LoginResponse>('/auth/login', { method: 'POST', body }),
  me: (token: string) => request<UserDto>('/users/me', { token }),
  createGame: (token: string, body: CreateGameRequest) =>
    request<GameStateDto>('/games', { method: 'POST', token, body }),
  getGame: (token: string, id: string) => request<GameStateDto>(`/games/${id}`, { token }),
  roll: (token: string, id: string) =>
    request<GameStateDto>(`/games/${id}/roll`, { method: 'POST', token }),
  hold: (token: string, id: string) =>
    request<GameStateDto>(`/games/${id}/hold`, { method: 'POST', token }),
};
