import { Body, Controller, Post } from '@nestjs/common';
import type { LoginResponse } from '@dice/contracts';
import { toUserDto } from '../../users/presentation/to-user-dto';
import { AuthService } from '../application/auth.service';
import { LoginDto } from './login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() { username }: LoginDto): Promise<LoginResponse> {
    const { accessToken, user } = await this.auth.login(username);
    return { accessToken, user: toUserDto(user) };
  }
}
