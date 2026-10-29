import { Controller, Get, UseGuards } from '@nestjs/common';
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
    // JwtStrategy.validate() already rejected tokens of unknown Users.
    return toUserDto(await this.users.getById(userId));
  }
}
