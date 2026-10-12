import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4002),
  SERVICE_NAME: z.string().default('news-service'),
  SERVICE_VERSION: z.string().default('0.1.0'),
  CORS_ORIGIN: z.string().default('*'),
  DATABASE_URL: z.string().optional().default('postgresql://postgres:postgres@localhost:5432/news_db?schema=public'),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function validateEnv(env: Record<string, unknown>): EnvConfig {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    const formattedErrors = JSON.stringify(result.error.format(), null, 2);
    throw new Error(`Invalid environment configuration for news-service:\n${formattedErrors}`);
  }
  return result.data;
}
