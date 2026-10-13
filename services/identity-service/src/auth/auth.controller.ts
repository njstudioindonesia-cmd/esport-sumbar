import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService, AuthResponse } from './auth.service';
import {
  RegisterDtoSchema,
  LoginDtoSchema,
  RefreshTokenDtoSchema,
  TwoFactorVerifyRequestSchema,
  TwoFactorSetupResponse,
} from '@esport-sumbar/contracts';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtPayload } from './token.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Mendaftar akun pengguna baru' })
  @ApiResponse({ status: 201, description: 'Pengguna berhasil terdaftar' })
  @ApiResponse({ status: 400, description: 'Validasi input gagal' })
  @ApiResponse({ status: 409, description: 'Email sudah terdaftar' })
  async register(@Body() rawBody: unknown): Promise<AuthResponse> {
    const parse = RegisterDtoSchema.safeParse(rawBody);
    if (!parse.success) {
      throw new BadRequestException({
        message: 'Validasi registrasi gagal',
        details: parse.error.format(),
      });
    }
    return this.authService.register(parse.data);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Masuk dengan email, password, target audience, dan kode 2FA (jika aktif)' })
  @ApiResponse({ status: 200, description: 'Berhasil login dan mendapatkan token' })
  @ApiResponse({ status: 401, description: 'Kredensial atau kode 2FA salah' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki izin akses ke portal tujuan' })
  async login(@Body() rawBody: unknown): Promise<AuthResponse> {
    const parse = LoginDtoSchema.safeParse(rawBody);
    if (!parse.success) {
      throw new BadRequestException({
        message: 'Format login tidak valid',
        details: parse.error.format(),
      });
    }
    return this.authService.login(parse.data);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Memperbarui akses token dengan refresh token rotation' })
  @ApiResponse({ status: 200, description: 'Token berhasil dirotasi' })
  @ApiResponse({ status: 401, description: 'Token refresh tidak valid atau kadaluarsa' })
  async refresh(@Body() rawBody: unknown): Promise<AuthResponse> {
    const parse = RefreshTokenDtoSchema.safeParse(rawBody);
    if (!parse.success) {
      throw new BadRequestException({
        message: 'Format token refresh tidak valid',
        details: parse.error.format(),
      });
    }
    return this.authService.refresh(parse.data);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Keluar dan mencabut refresh token' })
  @ApiResponse({ status: 200, description: 'Berhasil keluar' })
  async logout(@Body() rawBody: unknown): Promise<{ success: boolean; message: string }> {
    const parse = RefreshTokenDtoSchema.safeParse(rawBody);
    if (!parse.success) {
      throw new BadRequestException({
        message: 'Format token tidak valid',
        details: parse.error.format(),
      });
    }
    return this.authService.logout(parse.data);
  }

  @Post('2fa/generate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Menghasilkan rahasia baru dan tautan OTPAuth untuk aktivasi 2FA' })
  @ApiResponse({ status: 200, description: 'Rahasia dan URL OTPAuth berhasil dibuat' })
  async generateTwoFactor(@CurrentUser() user: JwtPayload): Promise<TwoFactorSetupResponse> {
    return this.authService.setupTwoFactor(user.sub);
  }

  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verifikasi kode 6 digit untuk mengaktifkan 2FA pada akun' })
  @ApiResponse({ status: 200, description: '2FA berhasil diaktifkan dengan recovery codes' })
  async verifyTwoFactor(
    @CurrentUser() user: JwtPayload,
    @Body() rawBody: unknown,
  ): Promise<{ enabled: boolean; recoveryCodes: string[] }> {
    const parse = TwoFactorVerifyRequestSchema.safeParse(rawBody);
    if (!parse.success) {
      throw new BadRequestException({
        message: 'Format kode verifikasi tidak valid. Harap masukkan 6 digit angka.',
        details: parse.error.format(),
      });
    }
    return this.authService.verifyAndEnableTwoFactor(user.sub, parse.data.token);
  }

  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Nonaktifkan 2FA dengan memasukkan kode TOTP' })
  @ApiResponse({ status: 200, description: '2FA berhasil dinonaktifkan' })
  async disableTwoFactor(
    @CurrentUser() user: JwtPayload,
    @Body() rawBody: unknown,
  ): Promise<{ disabled: boolean }> {
    const parse = TwoFactorVerifyRequestSchema.safeParse(rawBody);
    if (!parse.success) {
      throw new BadRequestException({
        message: 'Format kode verifikasi tidak valid. Harap masukkan 6 digit angka.',
        details: parse.error.format(),
      });
    }
    return this.authService.disableTwoFactor(user.sub, parse.data.token);
  }
}
