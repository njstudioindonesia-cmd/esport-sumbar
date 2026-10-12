import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  SERVICE_NAME: z.string().default('api-gateway'),
  SERVICE_VERSION: z.string().default('0.1.0'),
  CORS_ORIGIN: z.string().default('*'),
  IDENTITY_SERVICE_URL: z.string().default('http://localhost:4001'),
  NEWS_SERVICE_URL: z.string().default('http://localhost:4002'),
  AI_SERVICE_URL: z.string().default('http://localhost:4008'),
  NEWS_INGESTOR_URL: z.string().default('http://localhost:4003'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000), // 1 minute
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100), // 100 requests per window
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function validateEnv(env: Record<string, unknown>): EnvConfig {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    const formattedErrors = JSON.stringify(result.error.format(), null, 2);
    throw new Error(`Invalid environment configuration for gateway:\n${formattedErrors}`);
  }
  return result.data;
}
