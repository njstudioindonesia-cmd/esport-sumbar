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

    // 9. TELEMETRY & REALTIME DATABASE STATS
    stats: {
      cachedMetrics: null,
      pollTimer: null,

      async get() {
        const res = await request('/stats');
        if (res && res.metrics) {
          this.cachedMetrics = res.metrics;
        }
        return res;
      },

      async health() {
        return request('/health');
      },

      /**
       * Animasi transisi angka halus bergaya cyber esports (Ease-Out Cubic)
       */
      animateCount(element, targetVal, prefix = '', suffix = '', duration = 1200) {
        if (!element) return;
        const target = typeof targetVal === 'string' ? parseFloat(targetVal.replace(/[^0-9.-]+/g, '')) || 0 : Number(targetVal) || 0;
        const currentText = element.getAttribute('data-current-val') || element.textContent || '0';
        const start = parseFloat(currentText.replace(/[^0-9.-]+/g, '')) || 0;

        if (start === target && element.getAttribute('data-current-val')) {
          return; // Nilai sudah sama
        }

        element.setAttribute('data-current-val', target);
        const startTime = performance.now();

        function update(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic: 1 - pow(1 - x, 3)
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(start + (target - start) * easeOut);

          const formatted = target >= 1000 ? current.toLocaleString('id-ID') : current;
          element.textContent = `${prefix}${formatted}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            const finalFormatted = target >= 1000 ? target.toLocaleString('id-ID') : target;
            element.textContent = `${prefix}${finalFormatted}${suffix}`;
          }
        }

        requestAnimationFrame(update);
      },

      /**
       * Mengupdate seluruh elemen HTML dengan atribut data-stat
       */
      updateDOMWithMetrics(metrics) {
        if (!metrics) return;
        const elements = document.querySelectorAll('[data-stat]');
        elements.forEach(el => {
          const key = el.getAttribute('data-stat');
          const prefix = el.getAttribute('data-stat-prefix') || '';
          const suffix = el.getAttribute('data-stat-suffix') || '';

          if (key === 'pengcabAktif' && typeof metrics[key] === 'string') {
            el.textContent = `${prefix}${metrics[key]}${suffix}`;
            return;
          }

          if (metrics[key] !== undefined && metrics[key] !== null) {
            this.animateCount(el, metrics[key], prefix, suffix);
          }
        });

        // Trigger custom global event untuk komponen reaktif lainnya
        try {
          window.dispatchEvent(new CustomEvent('esport_sumbar_stats_updated', { detail: metrics }));
        } catch {}
      },

      /**
       * Inisialisasi realtime counter polling & initial load
       */
      async initLiveCounters(pollIntervalMs = 15000) {
        const fetchAndUpdate = async () => {
          try {
            const res = await this.get();
            if (res && res.metrics) {
              this.updateDOMWithMetrics(res.metrics);
              // Update live database status indicators
              const liveIndicators = document.querySelectorAll('.live-db-indicator');
              liveIndicators.forEach(ind => {
                ind.classList.remove('opacity-0');
                ind.classList.add('opacity-100');
              });
            }
          } catch (err) {
            console.warn('[Realtime Counter Sync Notice]:', err.message);
          }
        };

        // Initial fetch
        await fetchAndUpdate();

        // Setup real-time interval polling
        if (!this.pollTimer && pollIntervalMs > 0) {
          this.pollTimer = setInterval(fetchAndUpdate, pollIntervalMs);
        }
      }
    }
  };

  window.EsportSumbarAPI = EsportSumbarAPI;

  // Auto-init on page ready if data-stat elements exist
  if (typeof document !== 'undefined') {
    const startAutoLiveCounters = () => {
      if (document.querySelector('[data-stat]')) {
        EsportSumbarAPI.stats.initLiveCounters();
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startAutoLiveCounters);
    } else {
      setTimeout(startAutoLiveCounters, 50);
    }
  }

})(window);
