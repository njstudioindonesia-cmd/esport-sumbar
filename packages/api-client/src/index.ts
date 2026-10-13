import { PortalAudience } from '@esport-sumbar/contracts';
import { getPortalSession } from '@esport-sumbar/auth-client';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface ApiClientOptions {
  portal: PortalAudience;
  baseUrl?: string;
}

export class ApiClient {
  private readonly portal: PortalAudience;
  private readonly baseUrl: string;

  constructor(options: ApiClientOptions) {
    this.portal = options.portal;
    this.baseUrl =
      options.baseUrl ||
      (typeof process !== 'undefined' && process.env['NEXT_PUBLIC_API_URL']) ||
      'http://localhost:4000/api';
  }

  private resolveUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // If endpoint already starts with portal prefix or explicit route, keep it
    if (
      cleanEndpoint.startsWith('/public/') ||
      cleanEndpoint.startsWith('/eo/') ||
      cleanEndpoint.startsWith('/admin/')
    ) {
      return `${this.baseUrl}${cleanEndpoint}`;
    }

    // Automatically map to portal-prefixed route if not already prefixed
    if (this.portal === 'eo') {
      return `${this.baseUrl}/eo${cleanEndpoint}`;
    }
    if (this.portal === 'admin') {
      return `${this.baseUrl}/admin${cleanEndpoint}`;
    }
    return `${this.baseUrl}/public${cleanEndpoint}`;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = this.resolveUrl(endpoint);
    const { token } = getPortalSession(this.portal);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-portal-audience': this.portal,
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(url, {
        ...options,
        headers,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg =
          json?.error?.message ||
          json?.message ||
          (Array.isArray(json?.error?.details)
            ? json.error.details.join(', ')
            : 'Terjadi kesalahan sistem');
        return {
          success: false,
          error: errorMsg,
          statusCode: res.status,
        };
      }

      return {
        success: true,
        data: json?.data ?? json,
        statusCode: res.status,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Gagal menghubungi server API Gateway',
        statusCode: 500,
      };
    }
  }

  get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  post<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  patch<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export function createApiClient(portal: PortalAudience, baseUrl?: string): ApiClient {
  return new ApiClient({ portal, baseUrl });
}
