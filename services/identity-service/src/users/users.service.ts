import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  UserProfile,
  ApplyOrganizerDto,
} from '@esport-sumbar/contracts';
import { IdentityRepository } from '../database/identity.repository';
import { OrganizerProfileEntity, UserEntity } from '../database/models';
import { StructuredLogger } from '@esport-sumbar/utils';

@Injectable()
export class UsersService {
  private readonly logger = new StructuredLogger('users-service');

  constructor(private readonly repository: IdentityRepository) {}

  private mapToProfile(user: UserEntity): UserProfile {
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      city: user.city,
      mainGames: user.mainGames,
      twoFactorEnabled: !!user.twoFactorEnabled,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }
    return this.mapToProfile(user);
  }

  async updateProfile(
    userId: string,
    updates: { nickname?: string; city?: string; mainGames?: string[] },
  ): Promise<UserProfile> {
    const user = await this.repository.updateUserProfile(userId, updates);
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }
    return this.mapToProfile(user);
  }

  async applyOrganizer(userId: string, dto: ApplyOrganizerDto): Promise<OrganizerProfileEntity> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    if (user.role === 'ORGANIZER' || user.role === 'ADMIN') {
      throw new BadRequestException('Akun sudah memiliki hak akses Organizer atau Admin');
    }

    const existing = await this.repository.findOrganizerByUserId(userId);
    if (existing && existing.status === 'PENDING') {
      throw new ConflictException('Pengajuan sebelumnya masih menunggu verifikasi');
    }

    const id = uuidv4();
    const profile = await this.repository.createOrganizerProfile({
      id,
      userId,
      orgName: dto.orgName,
      contactPhone: dto.contactPhone,
      docs: dto.docs,
      socialLinks: dto.socialLinks,
    });

    this.logger.info(`Organizer application submitted: ${dto.orgName}`, 'UsersService', {
      userId,
      applicationId: id,
    });

    return profile;
  }

  async getOrganizerStatus(userId: string): Promise<OrganizerProfileEntity | null> {
    return this.repository.findOrganizerByUserId(userId);
  }

  async listPendingApplications(): Promise<OrganizerProfileEntity[]> {
    return this.repository.listPendingOrganizers();
  }

  async verifyApplication(
    applicationId: string,
    decision: 'APPROVED' | 'REJECTED',
    adminId: string,
    reason?: string,
  ): Promise<OrganizerProfileEntity> {
    const profile = await this.repository.findOrganizerById(applicationId);
    if (!profile) {
      throw new NotFoundException('Pengajuan tidak ditemukan');
    }

    if (profile.status !== 'PENDING') {
      throw new BadRequestException(`Pengajuan sudah diproses sebelumnya dengan status: ${profile.status}`);
    }

    const updated = await this.repository.updateOrganizerStatus(
      applicationId,
      decision,
      adminId,
      reason,
    );

    if (decision === 'APPROVED') {
      await this.repository.updateUserRole(profile.userId, 'ORGANIZER');
      this.logger.info(`Organizer application approved for user ${profile.userId}`, 'UsersService', {
        adminId,
        applicationId,
      });
    } else {
      this.logger.info(`Organizer application rejected for user ${profile.userId}`, 'UsersService', {
        adminId,
        applicationId,
        reason,
      });
    }

    return updated!;
  }
}
