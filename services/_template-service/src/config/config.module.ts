import { Global, Module } from '@nestjs/common';
import { validateEnv, EnvConfig } from './env.config';

export const ENV_CONFIG_TOKEN = 'ENV_CONFIG';

@Global()
@Module({
  providers: [
    {
      provide: ENV_CONFIG_TOKEN,
      useFactory: (): EnvConfig => validateEnv(process.env),
    },
  ],
  exports: [ENV_CONFIG_TOKEN],
})
export class AppConfigModule {}
