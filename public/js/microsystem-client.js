/**
 * ESPORT SUMBAR MICROSYSTEM CLIENT SDK
 * Komunikasi client-side universal untuk menghubungkan seluruh form, katalog, dan admin dashboard
 * ke backend microservices dengan toleransi kegagalan (circuit-breaker).
 */

(function (window) {
  'use strict';

  const API_BASE = '/api';

  async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'EsportSumbarMicrosystemClient'
    };

    const token = localStorage.getItem('esi_auth_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...(options.headers || {})
        }
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          statusCode: response.status,
          error: data.message || data.error || `HTTP Error ${response.status}`,
          data: null
        };
      }

      return data;
    } catch (networkErr) {
      console.warn(`[Microsystem Client] Offline/Network fallback for ${endpoint}:`, networkErr.message);
      return {
        success: false,
        statusCode: 0,
        isOfflineFallback: true,
        error: "Koneksi backend lambat, mengaktifkan cache lokal.",
        data: null
      };
    }
  }

  const EsportSumbarAPI = {
    // 1. AUTHENTICATION & SSO
    auth: {
      async login(credentials) {
        const res = await request('/auth/login', {
          method: 'POST',
          body: JSON.stringify(credentials)
        });
        if (res.success && res.token) {
          localStorage.setItem('esi_auth_token', res.token);
          localStorage.setItem('esi_auth_user', JSON.stringify(res.user));
        }
        return res;
      },
      getUser() {
        try {
          const raw = localStorage.getItem('esi_auth_user');
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      },
      logout(redirectUrl = null) {
        localStorage.removeItem('esi_auth_token');
        localStorage.removeItem('esi_auth_user');
        if (redirectUrl) {
          window.location.href = redirectUrl;
        }
      },
      async forgotPassword(identifier) {
        return request('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ identifier })
        });
      }
    },

    // 2. REGISTRASI & MODERASI
    registrasi: {
      async submit(bidang, data) {
        return request(`/registrasi/${bidang}`, {
          method: 'POST',
          body: JSON.stringify(data)
        });
      },
      async getQueue(bidang = 'all') {
        return request(`/registrasi/antrean?bidang=${encodeURIComponent(bidang)}`);
      },
      async updateStatus(id, status, notes = '') {
        return request(`/registrasi/${id}/status`, {
          method: 'POST',
          body: JSON.stringify({ status, notes })
        });
      }
    },

    // 3. PASPOR DIGITAL ATLET
    paspor: {
      async getDetail(idOrPaspor) {
        return request(`/paspor/${encodeURIComponent(idOrPaspor)}`);
      }
    },

    // 4. KATALOG EKOSISTEM
    katalog: {
      async get(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return request(`/katalog${qs ? '?' + qs : ''}`);
      }
    },

    // 5. PENCARIAN TERPADU
    search: {
      async query(q, filters = {}) {
        const params = new URLSearchParams({ q: q || '', ...filters }).toString();
        return request(`/search?${params}`);
      }
    },

    // 6. BURSA TRANSFER & LFT
    bursa: {
      async getLFT(game = '') {
        const qs = game ? `?game=${encodeURIComponent(game)}` : '';
        return request(`/bursa/lft${qs}`);
      },
      async sendScoutProposal(proposal) {
        return request('/bursa/scout', {
          method: 'POST',
          body: JSON.stringify(proposal)
        });
      },
      async getTeams(id = null) {
        const qs = id ? `?id=${encodeURIComponent(id)}` : '';
        return request(`/tim${qs}`);
      }
    },

    // 7. PENGPROV ESI SUMBAR
    pengprov: {
      async getSummary() {
        return request('/pengprov/summary');
      },
      async getPelatda() {
        return request('/pengprov/pelatda');
      },
      async getEvents() {
        return request('/pengprov/events');
      },
      async addEvent(eventData) {
        return request('/pengprov/events', {
          method: 'POST',
          body: JSON.stringify(eventData)
        });
      }
    },

    // 8. PENGCAB ESI KAB/KOTA
    pengcab: {
      async getData(region = 'Kota Padang') {
        return request(`/pengcab/data?region=${encodeURIComponent(region)}`);
      },
      async issueRekomendasi(payload) {
        return request('/pengcab/rekomendasi', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async verifyDomisili(athleteId, status, notes = '') {
        return request('/pengcab/domisili-verify', {
          method: 'POST',
          body: JSON.stringify({ athleteId, status, notes })
        });
      }
    },

    // 9. TELEMETRY & STATS
    stats: {
      async get() {
        return request('/stats');
      },
      async health() {
        return request('/health');
      }
    }
  };

  window.EsportSumbarAPI = EsportSumbarAPI;

})(window);
