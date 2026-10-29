import type { UserDto } from '@dice/contracts';
import { User } from '../domain/user';

export const toUserDto = (user: User): UserDto => ({
  id: user.id,
  username: user.username.value,
  winCount: user.winCount,
});
