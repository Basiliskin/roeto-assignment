import { INestApplication, ValidationPipe } from '@nestjs/common';

/** Global HTTP setup shared by main.ts and e2e tests. */
export function configureApp<T extends INestApplication>(app: T): T {
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  return app;
}
