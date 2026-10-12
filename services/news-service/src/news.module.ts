import { Module } from '@nestjs/common';
import { NewsRepository } from './database/news.repository';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { AdminNewsController } from './admin-news.controller';

@Module({
  controllers: [NewsController, AdminNewsController],
  providers: [NewsRepository, NewsService],
  exports: [NewsService, NewsRepository],
})
export class NewsModule {}
