import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/application/users.service';
import { User } from '../../users/domain/user';
import { ReservedUsernameError, Username } from '../../users/domain/username';

export interface JwtPayload {
  sub: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  /** Username-only login (ADR 0001): find-or-create the User, then sign a JWT. Nobody logs in as the Bot (R11). */
  async login(username: string): Promise<{ accessToken: string; user: User }> {
    if (Username.of(username).isBot) throw new ReservedUsernameError();
    const user = await this.users.findOrCreate(username);
    const payload: JwtPayload = { sub: user.id };
    return { accessToken: await this.jwt.signAsync(payload), user };
  }
}
