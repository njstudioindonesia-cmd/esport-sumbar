import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

export interface DecodedToken {
  sub: string;
  email: string;
  role: 'USER' | 'ORGANIZER' | 'ADMIN';
  nickname: string;
  aud?: 'public' | 'eo' | 'admin';
  exp?: number;
}

/**
 * Memverifikasi dan mendekode JWT token secara mandiri di Gateway
 */
export function decodeAndVerifyJwt(
  authHeader: string | undefined,
  secret: string,
): { valid: boolean; payload?: DecodedToken; error?: string } {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Token otentikasi tidak disediakan' };
  }

  const token = authHeader.substring(7).trim();
  const parts = token.split('.');
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
    return { valid: false, error: 'Format JWT tidak valid' };
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  // Signature validation (HMAC SHA256)
  try {
    const data = `${headerB64}.${payloadB64}`;
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('base64url');

    if (signatureB64 !== expectedSig) {
      return { valid: false, error: 'Tanda tangan token (signature) tidak valid' };
    }

    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload: DecodedToken = JSON.parse(payloadJson);

    // Expiry check
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return { valid: false, error: 'Token telah kadaluarsa' };
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: 'Gagal memproses token' };
  }
}

/**
 * Gateway Middleware: Isolasi 3 Portal & Cross-Portal Access Control
 */
export function createPortalGuardMiddleware(jwtSecret: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const path = req.path || req.url;

    const isAdminRoute = path.startsWith('/api/admin');
    const isEoRoute = path.startsWith('/api/eo');

    // Public routes don't strictly require a token
    if (!isAdminRoute && !isEoRoute) {
      if (req.headers.authorization) {
        const { valid, payload } = decodeAndVerifyJwt(req.headers.authorization, jwtSecret);
        if (valid && payload) {
          req.headers['x-user-id'] = payload.sub;
          req.headers['x-user-role'] = payload.role;
          if (payload.aud) req.headers['x-portal-audience'] = payload.aud;
        }
      }
      return next();
    }

    // Admin & EO routes require authentication
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Akses memerlukan token otentikasi',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { valid, payload, error } = decodeAndVerifyJwt(authHeader, jwtSecret);
    if (!valid || !payload) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: error || 'Token tidak valid',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Admin Portal Check
    if (isAdminRoute) {
      if (payload.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN_PORTAL_ACCESS',
            message: 'Akses ditolak: Hanya peran ADMIN yang diizinkan mengakses Admin Console',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }
      if (payload.aud && payload.aud !== 'admin') {
        res.status(403).json({
          success: false,
          error: {
            code: 'INVALID_AUDIENCE',
            message: `Akses ditolak: Token untuk portal '${payload.aud}' tidak dapat digunakan di Admin Console`,
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }

    // EO Studio Check
    if (isEoRoute) {
      if (payload.role !== 'ORGANIZER' && payload.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN_PORTAL_ACCESS',
            message: 'Akses ditolak: Hanya peran ORGANIZER atau ADMIN yang diizinkan mengakses EO Studio',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }
      if (payload.aud && payload.aud === 'public') {
        res.status(403).json({
          success: false,
          error: {
            code: 'INVALID_AUDIENCE',
            message: "Akses ditolak: Token untuk portal publik tidak dapat digunakan di EO Studio",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }

    // Set verified identity headers for upstream services
    req.headers['x-user-id'] = payload.sub;
    req.headers['x-user-role'] = payload.role;
    if (payload.aud) req.headers['x-portal-audience'] = payload.aud;

    return next();
  };
}
