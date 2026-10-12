import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/token.service';
import { UserProfile, SumbarCityEnum } from '@esport-sumbar/contracts';
import { z } from 'zod';

const UpdateProfileDtoSchema = z.object({
  nickname: z.string().min(3).max(30).optional(),
  city: SumbarCityEnum.optional(),
  mainGames: z.array(z.string()).optional(),
});

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Mendapatkan profil pengguna yang sedang login' })
  @ApiResponse({ status: 200, description: 'Profil berhasil didapatkan' })
  async getMe(@CurrentUser() user: JwtPayload): Promise<UserProfile> {
    return this.usersService.getProfile(user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Memperbarui profil pengguna' })
  @ApiResponse({ status: 200, description: 'Profil berhasil diperbarui' })
  async updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() rawBody: unknown,
  ): Promise<UserProfile> {
    const parse = UpdateProfileDtoSchema.safeParse(rawBody);
    if (!parse.success) {
      throw new BadRequestException({
        message: 'Format pembaruan profil tidak valid',
        details: parse.error.format(),
      });
    }
    return this.usersService.updateProfile(user.sub, parse.data);
  }
}
