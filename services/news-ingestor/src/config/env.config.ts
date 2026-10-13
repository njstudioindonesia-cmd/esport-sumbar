import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4003),
  SERVICE_NAME: z.string().default('news-ingestor'),
  SERVICE_VERSION: z.string().default('0.1.0'),
  CORS_ORIGIN: z.string().default('*'),
  AI_SERVICE_URL: z.string().default('http://localhost:4008'),
  NEWS_SERVICE_URL: z.string().default('http://localhost:4002'),
  INGEST_INTERVAL_MS: z.coerce.number().default(300000), // 5 minutes
  IG_APP_ID: z.string().optional().default(''),
  IG_APP_SECRET: z.string().optional().default(''),
  IG_USER_ID: z.string().optional().default('1784140029381'),
  IG_ACCESS_TOKEN: z.string().optional().default(''),
  IG_WEBHOOK_VERIFY_TOKEN: z.string().optional().default('esportsumbar_secret_verify_token'),
  IG_POLL_INTERVAL_MIN: z.coerce.number().default(15),
  IG_PUBLISH_MODE: z.enum(['REVIEW', 'AUTO']).default('REVIEW'),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function validateEnv(env: Record<string, unknown>): EnvConfig {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    const formattedErrors = JSON.stringify(result.error.format(), null, 2);
    throw new Error(`Invalid environment configuration for news-ingestor:\n${formattedErrors}`);
  }
  return result.data;
}
