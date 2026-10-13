import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';
import { IdentityRepository } from '../database/identity.repository';
import { UserEntity } from '../database/models';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { EnvConfig } from '../config/env.config';

describe('TokenService', () => {
  let tokenService: TokenService;
  let repository: IdentityRepository;
  let jwtService: JwtService;

  const mockConfig: EnvConfig = {
    NODE_ENV: 'test',
    PORT: 4001,
    SERVICE_NAME: 'identity-service',
    SERVICE_VERSION: '0.1.0',
    CORS_ORIGIN: '*',
    JWT_ACCESS_SECRET: 'test_jwt_access_secret_super_secure_key_12345',
    JWT_REFRESH_SECRET: 'test_jwt_refresh_secret_super_secure_key_67890',
    JWT_ACCESS_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
    DATABASE_URL: 'postgresql://localhost:5432/test',
    NATS_URL: 'nats://localhost:4222',
  };

  const mockUser: UserEntity = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'gamer@sumbar.id',
    passwordHash: 'hash',
    nickname: 'PadangSlayer',
    role: 'USER',
    city: 'Padang',
    mainGames: ['Mobile Legends'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrganizer: UserEntity = {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'eo@sumbar.id',
    passwordHash: 'hash',
    nickname: 'PadangArenaEO',
    role: 'ORGANIZER',
    city: 'Padang',
    mainGames: ['Valorant'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdmin: UserEntity = {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'admin@sumbar.id',
    passwordHash: 'hash',
    nickname: 'SuperAdmin',
    role: 'ADMIN',
    city: 'Padang',
    mainGames: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    repository = new IdentityRepository();
    jwtService = new JwtService({});
    tokenService = new TokenService(jwtService, repository, mockConfig);
  });

  it('should generate valid access and refresh tokens with default public audience', async () => {
    const tokens = await tokenService.generateTokens(mockUser);

    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
    expect(tokens.refreshToken).toContain(':');

    const decoded = tokenService.verifyAccessToken(tokens.accessToken);
    expect(decoded.sub).toBe(mockUser.id);
    expect(decoded.email).toBe(mockUser.email);
    expect(decoded.role).toBe(mockUser.role);
    expect(decoded.aud).toBe('public');
  });

  it('should reject non-admin users requesting admin audience', async () => {
    await expect(tokenService.generateTokens(mockUser, undefined, 'admin')).rejects.toThrow(
      ForbiddenException,
    );
    await expect(tokenService.generateTokens(mockOrganizer, undefined, 'admin')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should allow admin users requesting admin, eo, or public audience', async () => {
    const adminTokens = await tokenService.generateTokens(mockAdmin, undefined, 'admin');
    expect(tokenService.verifyAccessToken(adminTokens.accessToken).aud).toBe('admin');

    const eoTokens = await tokenService.generateTokens(mockAdmin, undefined, 'eo');
    expect(tokenService.verifyAccessToken(eoTokens.accessToken).aud).toBe('eo');

    const publicTokens = await tokenService.generateTokens(mockAdmin, undefined, 'public');
    expect(tokenService.verifyAccessToken(publicTokens.accessToken).aud).toBe('public');
  });

  it('should reject normal user from requesting eo audience, but allow organizer', async () => {
    await expect(tokenService.generateTokens(mockUser, undefined, 'eo')).rejects.toThrow(
      ForbiddenException,
    );
    const eoTokens = await tokenService.generateTokens(mockOrganizer, undefined, 'eo');
    expect(tokenService.verifyAccessToken(eoTokens.accessToken).aud).toBe('eo');
  });

  it('should rotate refresh token and return new tokens', async () => {
    await repository.createUser(mockUser);
    const initialTokens = await tokenService.generateTokens(mockUser);

    const rotated = await tokenService.rotateRefreshToken(initialTokens.refreshToken);
    expect(rotated.tokens.accessToken).toBeDefined();
    expect(rotated.tokens.refreshToken).not.toBe(initialTokens.refreshToken);

    // Old token should now be revoked and rejected
    await expect(tokenService.rotateRefreshToken(initialTokens.refreshToken)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should detect token theft/reuse and revoke entire family', async () => {
    await repository.createUser(mockUser);
    const initialTokens = await tokenService.generateTokens(mockUser);

    // Legitimate rotation
    const secondTokens = await tokenService.rotateRefreshToken(initialTokens.refreshToken);

    // Attacker tries to use the first (already rotated) token
    await expect(tokenService.rotateRefreshToken(initialTokens.refreshToken)).rejects.toThrow(
      'Terdeteksi penggunaan ulang token',
    );

    // Now even the second token (attacker or user) is revoked because family was compromised!
    await expect(tokenService.rotateRefreshToken(secondTokens.tokens.refreshToken)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
