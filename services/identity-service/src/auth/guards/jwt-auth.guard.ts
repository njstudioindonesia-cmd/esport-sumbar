import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TokenService } from '../token.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = (request.headers['authorization'] || (request.headers as any).authorization) as string | undefined;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token otentikasi tidak ditemukan');
    }

    const token = authHeader.substring(7).trim();
    const payload = this.tokenService.verifyAccessToken(token);
    (request as any).user = payload;
    return true;
  }
}
