import { Module } from '@nestjs/common';
import { InstagramConnectorService } from './instagram-connector.service';
import { InstagramController } from './instagram.controller';
import { DedupeService } from '../ingest/dedupe.service';

@Module({
  controllers: [InstagramController],
  providers: [InstagramConnectorService, DedupeService],
  exports: [InstagramConnectorService],
})
export class InstagramModule {}
