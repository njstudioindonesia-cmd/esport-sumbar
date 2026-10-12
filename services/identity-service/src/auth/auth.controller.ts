import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService, AuthResponse } from './auth.service';
import {
  RegisterDtoSchema,
  LoginDtoSchema,
  RefreshTokenDtoSchema,
} from '@esport-sumbar/contracts';

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
  @ApiOperation({ summary: 'Masuk dengan email dan password' })
  @ApiResponse({ status: 200, description: 'Berhasil login dan mendapatkan token' })
  @ApiResponse({ status: 401, description: 'Kredensial salah' })
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
}
