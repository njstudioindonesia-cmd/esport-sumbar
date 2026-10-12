import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { IdentityRepository } from '../database/identity.repository';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { EnvConfig } from '../config/env.config';

describe('AuthService', () => {
  let authService: AuthService;
  let repository: IdentityRepository;
  let passwordService: PasswordService;
  let tokenService: TokenService;

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

  beforeEach(() => {
    repository = new IdentityRepository();
    passwordService = new PasswordService();
    tokenService = new TokenService(new JwtService({}), repository, mockConfig);
    authService = new AuthService(repository, passwordService, tokenService);
  });

  it('should register a new user successfully', async () => {
    const res = await authService.register({
      email: 'gamer@sumbar.id',
      password: 'StrongPassword123!',
      nickname: 'MinangGamer',
      city: 'Padang',
      mainGames: ['Mobile Legends'],
    });

    expect(res.user.id).toBeDefined();
    expect(res.user.email).toBe('gamer@sumbar.id');
    expect(res.user.role).toBe('USER');
    expect(res.tokens.accessToken).toBeDefined();
    expect(res.tokens.refreshToken).toBeDefined();
  });

  it('should prevent registration with duplicate email', async () => {
    await authService.register({
      email: 'gamer@sumbar.id',
      password: 'StrongPassword123!',
      nickname: 'MinangGamer',
      city: 'Padang',
      mainGames: ['Mobile Legends'],
    });

    await expect(
      authService.register({
        email: 'GAMER@sumbar.id',
        password: 'AnotherPassword123!',
        nickname: 'AnotherNick',
        city: 'Bukittinggi',
        mainGames: [],
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should login with valid credentials', async () => {
    await authService.register({
      email: 'gamer@sumbar.id',
      password: 'StrongPassword123!',
      nickname: 'MinangGamer',
      city: 'Padang',
      mainGames: ['Mobile Legends'],
    });

    const loginRes = await authService.login({
      email: 'gamer@sumbar.id',
      password: 'StrongPassword123!',
    });

    expect(loginRes.user.email).toBe('gamer@sumbar.id');
    expect(loginRes.tokens.accessToken).toBeDefined();
  });

  it('should reject login with invalid password', async () => {
    await authService.register({
      email: 'gamer@sumbar.id',
      password: 'StrongPassword123!',
      nickname: 'MinangGamer',
      city: 'Padang',
      mainGames: ['Mobile Legends'],
    });

    await expect(
      authService.login({
        email: 'gamer@sumbar.id',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
