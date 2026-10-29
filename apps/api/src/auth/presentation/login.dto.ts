import type { LoginRequest } from '@dice/contracts';
import { Transform } from 'class-transformer';
import { IsString, Matches } from 'class-validator';

export class LoginDto implements LoginRequest {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Matches(/^[a-zA-Z0-9_]{3,20}$/, {
    message: 'username must be 3–20 characters: letters, digits or underscore',
  })
  username: string;
}
