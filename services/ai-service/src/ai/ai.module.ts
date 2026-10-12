import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ClaudeLlmProvider } from '../providers/claude-llm.provider';
import { MockLlmProvider } from '../providers/mock-llm.provider';

@Module({
  controllers: [AiController],
  providers: [AiService, ClaudeLlmProvider, MockLlmProvider],
  exports: [AiService, ClaudeLlmProvider, MockLlmProvider],
})
export class AiModule {}
