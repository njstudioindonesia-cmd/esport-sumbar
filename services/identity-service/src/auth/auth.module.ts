import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { TotpService } from './totp.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { IdentityRepository } from '../database/identity.repository';

@Module({
  imports: [
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
    TotpService,
    JwtAuthGuard,
    RolesGuard,
    IdentityRepository,
  ],
  exports: [
    AuthService,
    PasswordService,
    TokenService,
    TotpService,
    JwtAuthGuard,
    RolesGuard,
    IdentityRepository,
  ],
})
export class AuthModule {}
