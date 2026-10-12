import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto, LoginDto, RefreshTokenDto, UserProfile } from '@esport-sumbar/contracts';
import { IdentityRepository } from '../database/identity.repository';
import { PasswordService } from './password.service';
import { TokenService, AuthTokens } from './token.service';
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
  ) {}

  private mapToProfile(user: UserEntity): UserProfile {
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      city: user.city,
      mainGames: user.mainGames,
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

    const tokens = await this.tokenService.generateTokens(user);

    this.logger.info(`User logged in: ${user.email}`, 'AuthService', {
      userId: user.id,
    });

    return {
      user: this.mapToProfile(user),
      tokens,
    };
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthResponse> {
    const { tokens, user } = await this.tokenService.rotateRefreshToken(dto.refreshToken);
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
}
