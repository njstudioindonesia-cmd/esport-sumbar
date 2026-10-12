import { Module } from '@nestjs/common';
import { DedupeService } from './dedupe.service';
import { FeedFetcherService } from './feed-fetcher.service';
import { IngestPipelineService } from './ingest-pipeline.service';
import { IngestController } from './ingest.controller';

@Module({
  controllers: [IngestController],
  providers: [DedupeService, FeedFetcherService, IngestPipelineService],
  exports: [DedupeService, IngestPipelineService],
})
export class IngestModule {}
