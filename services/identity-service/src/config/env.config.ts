import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4001),
  SERVICE_NAME: z.string().default('identity-service'),
  SERVICE_VERSION: z.string().default('0.1.0'),
  CORS_ORIGIN: z.string().default('*'),
  JWT_ACCESS_SECRET: z.string().default('dev_jwt_access_secret_super_secure_key_12345'),
  JWT_REFRESH_SECRET: z.string().default('dev_jwt_refresh_secret_super_secure_key_67890'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  DATABASE_URL: z.string().optional().default('postgresql://postgres:postgres@localhost:5432/identity_db?schema=public'),
  NATS_URL: z.string().optional().default('nats://localhost:4222'),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function validateEnv(env: Record<string, unknown>): EnvConfig {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    const formattedErrors = JSON.stringify(result.error.format(), null, 2);
    throw new Error(`Invalid environment configuration for identity-service:\n${formattedErrors}`);
  }
  return result.data;
}
