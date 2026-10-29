import { ConfigService } from '@nestjs/config';

const DEV_SECRET = 'dev-only-change-me';

export const jwtSecret = (config: ConfigService): string =>
  config.get<string>('JWT_SECRET') ?? DEV_SECRET;
