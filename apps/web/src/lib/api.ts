const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface UserSession {
  id: string;
  email: string;
  nickname: string;
  role: 'USER' | 'ORGANIZER' | 'ADMIN';
  city?: string | null;
  mainGames: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export function saveSession(user: UserSession, tokens: AuthTokens): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('esport_user', JSON.stringify(user));
  localStorage.setItem('esport_access_token', tokens.accessToken);
  localStorage.setItem('esport_refresh_token', tokens.refreshToken);
}

export function getSession(): { user: UserSession | null; token: string | null } {
  if (typeof window === 'undefined') return { user: null, token: null };
  const rawUser = localStorage.getItem('esport_user');
  const token = localStorage.getItem('esport_access_token');
  try {
    return {
      user: rawUser ? JSON.parse(rawUser) : null,
      token,
    };
  } catch {
    return { user: null, token: null };
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('esport_user');
  localStorage.removeItem('esport_access_token');
  localStorage.removeItem('esport_refresh_token');
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ success: boolean; data?: T; error?: string }> {
  const { token } = getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      const errMsg =
        data?.error?.message ||
        data?.message ||
        (Array.isArray(data?.error?.details) ? data.error.details.join(', ') : 'Terjadi kesalahan sistem');
      return { success: false, error: errMsg };
    }

    return { success: true, data: data?.data ?? data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menghubungi server' };
  }
}
