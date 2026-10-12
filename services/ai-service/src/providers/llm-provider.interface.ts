export interface LlmUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  estimatedCostUsd: number;
}

export interface LlmCompletionResult {
  content: string;
  usage: LlmUsage;
  provider: string;
}

export interface ILlmProvider {
  name: string;
  generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    temperature?: number,
  ): Promise<LlmCompletionResult>;
}
