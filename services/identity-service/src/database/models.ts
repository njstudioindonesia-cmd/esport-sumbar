import { UserRole } from '@esport-sumbar/contracts';

export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  nickname: string;
  role: UserRole;
  city?: string | null;
  mainGames: string[];
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string | null;
  twoFactorRecoveryCodes?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type OrganizerVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface OrganizerProfileEntity {
  id: string;
  userId: string;
  orgName: string;
  contactPhone: string;
  docs: string[];
  socialLinks?: Record<string, string>;
  status: OrganizerVerificationStatus;
  verifiedAt?: Date | null;
  verifiedBy?: string | null;
  rejectionReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshTokenEntity {
  id: string;
  userId: string;
  tokenHash: string;
  familyId: string;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
}
