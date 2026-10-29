import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/application/users.service';
import { JwtPayload } from '../application/auth.service';
import { AuthUser } from '../presentation/current-user.decorator';
import { jwtSecret } from './jwt-secret';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly users: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret(config),
    });
  }

  /** Rejects tokens whose User no longer exists (e.g. after an API restart). */
  async validate({ sub }: JwtPayload): Promise<AuthUser> {
    if (!(await this.users.findById(sub))) throw new UnauthorizedException();
    return { userId: sub };
  }
}
