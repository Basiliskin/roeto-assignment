import { Controller, Get, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { UserDto } from '@dice/contracts';
import { AuthUser, CurrentUser } from '../../auth/presentation/current-user.decorator';
import { JwtAuthGuard } from '../../auth/infrastructure/jwt-auth.guard';
import { UsersService } from '../application/users.service';
import { toUserDto } from './to-user-dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  async me(@CurrentUser() { userId }: AuthUser): Promise<UserDto> {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    return toUserDto(user);
  }
}
