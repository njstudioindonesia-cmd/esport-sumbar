import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4008),
  SERVICE_NAME: z.string().default('ai-service'),
  SERVICE_VERSION: z.string().default('0.1.0'),
  CORS_ORIGIN: z.string().default('*'),
  ANTHROPIC_API_KEY: z.string().optional().default(''),
  DEFAULT_LLM_PROVIDER: z.enum(['claude', 'mock']).default('mock'),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function validateEnv(env: Record<string, unknown>): EnvConfig {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    const formattedErrors = JSON.stringify(result.error.format(), null, 2);
    throw new Error(`Invalid environment configuration for ai-service:\n${formattedErrors}`);
  }
  return result.data;
}
