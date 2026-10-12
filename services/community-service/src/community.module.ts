import { Module } from '@nestjs/common';
import { CommunityRepository } from './database/community.repository';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { AdminModerationController } from './admin-moderation.controller';

@Module({
  controllers: [CommunityController, AdminModerationController],
  providers: [CommunityRepository, CommunityService],
  exports: [CommunityService, CommunityRepository],
})
export class CommunityModule {}
