import { Injectable, Inject } from '@nestjs/common';
import { ILlmProvider, LlmCompletionResult } from './llm-provider.interface';
import { EnvConfig } from '../config/env.config';
import { ENV_CONFIG_TOKEN } from '../config/config.module';
import { MockLlmProvider } from './mock-llm.provider';
import { StructuredLogger } from '@esport-sumbar/utils';

@Injectable()
export class ClaudeLlmProvider implements ILlmProvider {
  readonly name = 'claude-3-5-sonnet';
  private readonly logger = new StructuredLogger('claude-provider');

  constructor(
    @Inject(ENV_CONFIG_TOKEN) private readonly config: EnvConfig,
    private readonly mockFallback: MockLlmProvider,
  ) {}

  async generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.3,
  ): Promise<LlmCompletionResult> {
    const apiKey = this.config.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey.startsWith('sk-ant-api03-placeholder') || apiKey.length < 10) {
      this.logger.debug(
        'ANTHROPIC_API_KEY not configured or placeholder detected; using robust dev fallback provider',
        'ClaudeLlmProvider',
      );
      return this.mockFallback.generateCompletion(systemPrompt, userPrompt, temperature);
    }

    const startTime = Date.now();

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1500,
          temperature,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const content = data.content?.[0]?.text || '';
      const latencyMs = Date.now() - startTime;
      const promptTokens = data.usage?.input_tokens || 0;
      const completionTokens = data.usage?.output_tokens || 0;
      const totalTokens = promptTokens + completionTokens;
      // Claude 3.5 Sonnet pricing: $3 / million input, $15 / million output
      const estimatedCostUsd =
        (promptTokens / 1_000_000) * 3 + (completionTokens / 1_000_000) * 15;

      return {
        content,
        provider: this.name,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens,
          latencyMs,
          estimatedCostUsd: Math.round(estimatedCostUsd * 10000) / 10000,
        },
      };
    } catch (err: any) {
      this.logger.error('Claude API call failed; falling back to resilient engine', err);
      return this.mockFallback.generateCompletion(systemPrompt, userPrompt, temperature);
    }
  }
}
