import { Injectable } from '@nestjs/common';
import { UserEntity, OrganizerProfileEntity, RefreshTokenEntity, OrganizerVerificationStatus } from './models';
import { UserRole } from '@esport-sumbar/contracts';

@Injectable()
export class IdentityRepository {
  private users: Map<string, UserEntity> = new Map();
  private organizers: Map<string, OrganizerProfileEntity> = new Map();
  private refreshTokens: Map<string, RefreshTokenEntity> = new Map();

  // --- Users ---
  async createUser(user: Omit<UserEntity, 'createdAt' | 'updatedAt'>): Promise<UserEntity> {
    const now = new Date();
    const entity: UserEntity = {
      ...user,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(entity.id, entity);
    return entity;
  }

  async findUserById(id: string): Promise<UserEntity | null> {
    return this.users.get(id) || null;
  }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    const normalized = email.toLowerCase().trim();
    for (const u of this.users.values()) {
      if (u.email.toLowerCase().trim() === normalized) {
        return u;
      }
    }
    return null;
  }

  async updateUserRole(userId: string, role: UserRole): Promise<UserEntity | null> {
    const user = this.users.get(userId);
    if (!user) return null;
    user.role = role;
    user.updatedAt = new Date();
    this.users.set(userId, user);
    return user;
  }

  async updateUserProfile(
    userId: string,
    updates: Partial<Pick<UserEntity, 'nickname' | 'city' | 'mainGames'>>,
  ): Promise<UserEntity | null> {
    const user = this.users.get(userId);
    if (!user) return null;
    if (updates.nickname !== undefined) user.nickname = updates.nickname;
    if (updates.city !== undefined) user.city = updates.city;
    if (updates.mainGames !== undefined) user.mainGames = updates.mainGames;
    user.updatedAt = new Date();
    this.users.set(userId, user);
    return user;
  }

  // --- Organizer Profiles ---
  async createOrganizerProfile(
    profile: Omit<OrganizerProfileEntity, 'createdAt' | 'updatedAt' | 'status'>,
  ): Promise<OrganizerProfileEntity> {
    const now = new Date();
    const entity: OrganizerProfileEntity = {
      ...profile,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    };
    this.organizers.set(entity.id, entity);
    return entity;
  }

  async findOrganizerByUserId(userId: string): Promise<OrganizerProfileEntity | null> {
    for (const p of this.organizers.values()) {
      if (p.userId === userId) return p;
    }
    return null;
  }

  async findOrganizerById(id: string): Promise<OrganizerProfileEntity | null> {
    return this.organizers.get(id) || null;
  }

  async listPendingOrganizers(): Promise<OrganizerProfileEntity[]> {
    return Array.from(this.organizers.values()).filter((p) => p.status === 'PENDING');
  }

  async updateOrganizerStatus(
    id: string,
    status: OrganizerVerificationStatus,
    verifiedBy: string,
    reason?: string,
  ): Promise<OrganizerProfileEntity | null> {
    const profile = this.organizers.get(id);
    if (!profile) return null;
    profile.status = status;
    profile.verifiedBy = verifiedBy;
    profile.verifiedAt = new Date();
    if (reason) profile.rejectionReason = reason;
    profile.updatedAt = new Date();
    this.organizers.set(id, profile);
    return profile;
  }

  // --- Refresh Tokens (Rotation & Family Revocation) ---
  async saveRefreshToken(token: RefreshTokenEntity): Promise<void> {
    this.refreshTokens.set(token.id, token);
  }

  async findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenEntity | null> {
    for (const t of this.refreshTokens.values()) {
      if (t.tokenHash === tokenHash) return t;
    }
    return null;
  }

  async revokeRefreshToken(id: string): Promise<void> {
    const token = this.refreshTokens.get(id);
    if (token) {
      token.isRevoked = true;
      this.refreshTokens.set(id, token);
    }
  }

  async revokeTokenFamily(familyId: string): Promise<void> {
    for (const [id, token] of this.refreshTokens.entries()) {
      if (token.familyId === familyId) {
        token.isRevoked = true;
        this.refreshTokens.set(id, token);
      }
    }
  }

  // Reset helper for tests
  clearAll(): void {
    this.users.clear();
    this.organizers.clear();
    this.refreshTokens.clear();
  }
}
