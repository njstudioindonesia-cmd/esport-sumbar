import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { OrganizerController } from './organizer.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UsersController, OrganizerController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
