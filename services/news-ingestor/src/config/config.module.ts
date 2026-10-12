import { Module, Global } from '@nestjs/common';
import { validateEnv, EnvConfig } from './env.config';

@Global()
@Module({
  providers: [
    {
      provide: 'CONFIG',
      useFactory: (): EnvConfig => validateEnv(process.env),
    },
  ],
  exports: ['CONFIG'],
})
export class ConfigModule {}
