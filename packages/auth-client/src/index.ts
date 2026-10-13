import { PortalAudience, UserRole } from '@esport-sumbar/contracts';

export interface PortalUserSession {
  id: string;
  email: string;
  nickname: string;
  role: UserRole;
  city?: string | null;
  mainGames: string[];
  audience?: PortalAudience;
  twoFactorVerified?: boolean;
}

export interface PortalAuthTokens {
  accessToken: string;
  refreshToken: string;
  audience: PortalAudience;
}

export const PORTAL_STORAGE_KEYS = {
  public: 'esport_public_token',
  eo: 'esport_eo_token',
  admin: 'esport_admin_token',
  publicUser: 'esport_public_user',
  eoUser: 'esport_eo_user',
  adminUser: 'esport_admin_user',
} as const;

/**
 * Validates whether a user session has permissions to access a specific portal
 */
export function validatePortalAccess(
  role: UserRole | undefined,
  requiredPortal: PortalAudience,
): { allowed: boolean; reason?: string } {
  if (!role) {
    return { allowed: false, reason: 'Pengguna belum terautentikasi.' };
  }

  if (requiredPortal === 'public') {
    return { allowed: true };
  }

  if (requiredPortal === 'eo') {
    if (role === 'ORGANIZER' || role === 'ADMIN') {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Akses ditolak: Akun Anda belum memiliki hak akses Event Organizer (ORGANIZER).',
    };
  }

  if (requiredPortal === 'admin') {
    if (role === 'ADMIN') {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Akses ditolak: Portal ini hanya diperuntukkan bagi Administrator (ADMIN).',
    };
  }

  return { allowed: false, reason: 'Audience portal tidak dikenal.' };
}

export function savePortalSession(
  portal: PortalAudience,
  user: PortalUserSession,
  tokens: PortalAuthTokens,
): void {
  if (typeof window === 'undefined') return;
  const userKey = PORTAL_STORAGE_KEYS[`${portal}User` as keyof typeof PORTAL_STORAGE_KEYS];
  const tokenKey = PORTAL_STORAGE_KEYS[portal];

  localStorage.setItem(userKey, JSON.stringify(user));
  localStorage.setItem(tokenKey, tokens.accessToken);
  localStorage.setItem(`${tokenKey}_refresh`, tokens.refreshToken);
}

export function getPortalSession(portal: PortalAudience): {
  user: PortalUserSession | null;
  token: string | null;
} {
  if (typeof window === 'undefined') return { user: null, token: null };
  const userKey = PORTAL_STORAGE_KEYS[`${portal}User` as keyof typeof PORTAL_STORAGE_KEYS];
  const tokenKey = PORTAL_STORAGE_KEYS[portal];

  const rawUser = localStorage.getItem(userKey);
  const token = localStorage.getItem(tokenKey);

  try {
    return {
      user: rawUser ? JSON.parse(rawUser) : null,
      token,
    };
  } catch {
    return { user: null, token: null };
  }
}

export function clearPortalSession(portal: PortalAudience): void {
  if (typeof window === 'undefined') return;
  const userKey = PORTAL_STORAGE_KEYS[`${portal}User` as keyof typeof PORTAL_STORAGE_KEYS];
  const tokenKey = PORTAL_STORAGE_KEYS[portal];

  localStorage.removeItem(userKey);
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(`${tokenKey}_refresh`);
}

/**
 * Decodes JWT token payload without external crypto libraries
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadBase64 = parts[1]!.replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = decodeURIComponent(
      atob(payloadBase64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}
