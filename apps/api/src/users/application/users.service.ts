import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { User } from '../domain/user';
import { USER_REPOSITORY, UserRepository } from '../domain/user.repository';
import { Username } from '../domain/username';

@Injectable()
export class UsersService {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}

  async findOrCreate(rawUsername: string): Promise<User> {
    const username = Username.of(rawUsername);
    const existing = await this.users.findByUsername(username);
    if (existing) return existing;
    const user = User.create(randomUUID(), username);
    await this.users.save(user);
    return user;
  }

  findById(id: string): Promise<User | null> {
    return this.users.findById(id);
  }

  /** For ids that must exist (e.g. Players of a stored Game). */
  async getById(id: string): Promise<User> {
    const user = await this.users.findById(id);
    if (!user) throw new Error(`User ${id} not found`);
    return user;
  }

  async recordWin(userId: string): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user) return;
    user.recordWin();
    await this.users.save(user);
  }
}
