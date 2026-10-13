import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  UserProfile,
  TwoFactorSetupResponse,
} from '@esport-sumbar/contracts';
import { IdentityRepository } from '../database/identity.repository';
import { PasswordService } from './password.service';
import { TokenService, AuthTokens } from './token.service';
import { TotpService } from './totp.service';
import { UserEntity } from '../database/models';
import { StructuredLogger } from '@esport-sumbar/utils';

export interface AuthResponse {
  user: UserProfile;
  tokens: AuthTokens;
}

@Injectable()
export class AuthService {
  private readonly logger = new StructuredLogger('auth-service');

  constructor(
    private readonly repository: IdentityRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly totpService: TotpService,
  ) {}

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

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.repository.findUserByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email sudah terdaftar dalam sistem');
    }

    const passwordHash = await this.passwordService.hash(dto.password);
    const id = uuidv4();

    const user = await this.repository.createUser({
      id,
      email: dto.email,
      passwordHash,
      nickname: dto.nickname,
      role: 'USER',
      city: dto.city || null,
      mainGames: dto.mainGames || [],
    });

    const tokens = await this.tokenService.generateTokens(user);

    this.logger.info(`User registered successfully: ${user.email}`, 'AuthService', {
      userId: user.id,
      role: user.role,
    });

    return {
      user: this.mapToProfile(user),
      tokens,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.repository.findUserByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Kredensial tidak valid');
    }

    const isMatch = await this.passwordService.verify(user.passwordHash, dto.password);
    if (!isMatch) {
      throw new UnauthorizedException('Kredensial tidak valid');
    }

    // 2FA TOTP check: required for ADMIN or any user with twoFactorEnabled = true
    const is2faRequired = user.role === 'ADMIN' || !!user.twoFactorEnabled;
    if (is2faRequired && user.twoFactorSecret) {
      if (!dto.code2fa) {
        throw new UnauthorizedException('Akun ini membutuhkan verifikasi kode 2FA TOTP (6 digit)');
      }
      const isValidTotp = this.totpService.verifyTotp(dto.code2fa, user.twoFactorSecret);
      const isRecoveryMatch = user.twoFactorRecoveryCodes?.includes(dto.code2fa.trim().toUpperCase());
      if (!isValidTotp && !isRecoveryMatch) {
        throw new UnauthorizedException('Kode 2FA TOTP salah atau telah kadaluarsa');
      }
    }

    const tokens = await this.tokenService.generateTokens(user, undefined, dto.audience);

    this.logger.info(`User logged in: ${user.email} (audience: ${dto.audience || 'public'})`, 'AuthService', {
      userId: user.id,
      role: user.role,
      audience: dto.audience,
    });

    return {
      user: this.mapToProfile(user),
      tokens,
    };
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthResponse> {
    const { tokens, user } = await this.tokenService.rotateRefreshToken(
      dto.refreshToken,
      dto.audience,
    );
    return {
      user: this.mapToProfile(user),
      tokens,
    };
  }

  async logout(dto: RefreshTokenDto): Promise<{ success: boolean; message: string }> {
    await this.tokenService.revokeToken(dto.refreshToken);
    return {
      success: true,
      message: 'Berhasil keluar dan sesi telah dicabut',
    };
  }

  async setupTwoFactor(userId: string): Promise<TwoFactorSetupResponse> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    const secret = this.totpService.generateSecret();
    const otpauthUrl = this.totpService.generateOtpAuthUrl(user.email, secret);
    await this.repository.setTwoFactorSecret(user.id, secret);

    return {
      secret,
      otpauthUrl,
    };
  }

  async verifyAndEnableTwoFactor(
    userId: string,
    token: string,
  ): Promise<{ enabled: boolean; recoveryCodes: string[] }> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    if (!user.twoFactorSecret) {
      throw new BadRequestException('Silakan inisiasi setup 2FA terlebih dahulu');
    }

    const isValid = this.totpService.verifyTotp(token, user.twoFactorSecret);
    if (!isValid) {
      throw new BadRequestException('Kode 2FA TOTP salah atau telah kadaluarsa');
    }

    const recoveryCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase(),
    );

    await this.repository.enableTwoFactor(user.id, user.twoFactorSecret, recoveryCodes);

    this.logger.info(`2FA enabled for user: ${user.email}`, 'AuthService', { userId: user.id });

    return {
      enabled: true,
      recoveryCodes,
    };
  }

  async disableTwoFactor(userId: string, token: string): Promise<{ disabled: boolean }> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    if (!user.twoFactorSecret) {
      throw new BadRequestException('2FA belum diaktifkan pada akun ini');
    }

    const isValid = this.totpService.verifyTotp(token, user.twoFactorSecret);
    if (!isValid) {
      throw new BadRequestException('Kode 2FA TOTP tidak valid');
    }

    await this.repository.disableTwoFactor(user.id);
    this.logger.info(`2FA disabled for user: ${user.email}`, 'AuthService', { userId: user.id });

    return { disabled: true };
  }
}
