import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { UserEntity } from '../database/models';
import { IdentityRepository } from '../database/identity.repository';
import { EnvConfig } from '../config/env.config';
import { ENV_CONFIG_TOKEN } from '../config/config.module';
import { UserRole } from '@esport-sumbar/contracts';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  nickname: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // in seconds
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly repository: IdentityRepository,
    @Inject(ENV_CONFIG_TOKEN) private readonly config: EnvConfig,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async generateTokens(user: UserEntity, existingFamilyId?: string): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      nickname: user.nickname,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.JWT_ACCESS_SECRET,
      expiresIn: this.config.JWT_ACCESS_EXPIRES_IN as any,
    });

    const rawRefreshToken = uuidv4() + '.' + crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);
    const familyId = existingFamilyId || uuidv4();

    // 7 days expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.repository.saveRefreshToken({
      id: uuidv4(),
      userId: user.id,
      tokenHash,
      familyId,
      isRevoked: false,
      expiresAt,
      createdAt: new Date(),
    });

    return {
      accessToken,
      refreshToken: `${familyId}:${rawRefreshToken}`,
      expiresIn: 15 * 60, // 15 minutes
    };
  }

  async rotateRefreshToken(refreshTokenString: string): Promise<{ tokens: AuthTokens; user: UserEntity }> {
    const parts = refreshTokenString.split(':');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new UnauthorizedException('Token refresh tidak valid');
    }

    const [familyId, rawToken] = parts;
    const tokenHash = this.hashToken(rawToken);

    const storedToken = await this.repository.findRefreshTokenByHash(tokenHash);

    if (!storedToken) {
      throw new UnauthorizedException('Token refresh tidak ditemukan');
    }

    // Reuse Detection: If this token was already revoked, someone is replaying a stolen token!
    if (storedToken.isRevoked) {
      await this.repository.revokeTokenFamily(familyId);
      throw new UnauthorizedException('Terdeteksi penggunaan ulang token. Semua sesi dibatalkan untuk keamanan.');
    }

    // Check expiration
    if (new Date() > storedToken.expiresAt) {
      await this.repository.revokeRefreshToken(storedToken.id);
      throw new UnauthorizedException('Token refresh telah kadaluarsa');
    }

    // Revoke old token
    await this.repository.revokeRefreshToken(storedToken.id);

    const user = await this.repository.findUserById(storedToken.userId);
    if (!user) {
      throw new UnauthorizedException('Pengguna tidak ditemukan');
    }

    // Generate new token pair in same family
    const tokens = await this.generateTokens(user, familyId);
    return { tokens, user };
  }

  async revokeToken(refreshTokenString: string): Promise<void> {
    const parts = refreshTokenString.split(':');
    if (parts.length === 2 && parts[1]) {
      const tokenHash = this.hashToken(parts[1]);
      const stored = await this.repository.findRefreshTokenByHash(tokenHash);
      if (stored) {
        await this.repository.revokeRefreshToken(stored.id);
      }
    }
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token, {
        secret: this.config.JWT_ACCESS_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Akses token tidak valid atau telah kadaluarsa');
    }
  }
}
