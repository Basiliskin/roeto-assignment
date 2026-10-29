import { Injectable } from '@nestjs/common';
import { User } from '../domain/user';
import { UserRepository } from '../domain/user.repository';
import { Username } from '../domain/username';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async findByUsername(username: Username): Promise<User | null> {
    return [...this.users.values()].find((u) => u.username.equals(username)) ?? null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }
}
