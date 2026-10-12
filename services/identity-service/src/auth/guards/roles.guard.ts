import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@esport-sumbar/contracts';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../token.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user?: JwtPayload }>();

    if (!user) {
      throw new ForbiddenException('Akses ditolak: Pengguna tidak terautentikasi');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Akses ditolak: Peran '${user.role}' tidak memiliki izin (membutuhkan salah satu dari: ${requiredRoles.join(', ')})`,
      );
    }

    return true;
  }
}
