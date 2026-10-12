import { Controller, Post, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IngestPipelineService } from './ingest-pipeline.service';

@ApiTags('Ingestion Pipeline')
@Controller('ingest')
export class IngestController {
  constructor(private readonly pipeline: IngestPipelineService) {}

  @Post('trigger')
  @ApiOperation({ summary: 'Memicu siklus pipeline kurasi berita mentah secara manual' })
  @ApiResponse({ status: 200, description: 'Hasil eksekusi pipeline kurasi' })
  async triggerIngest() {
    return this.pipeline.runPipeline();
  }

  @Get('status')
  @ApiOperation({ summary: 'Melihat status metrik deduplikasi dan total kurasi berita' })
  getStatus() {
    return this.pipeline.getStatus();
  }
}
