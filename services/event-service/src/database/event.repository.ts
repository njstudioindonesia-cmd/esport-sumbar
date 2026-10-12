import { Injectable } from '@nestjs/common';
import {
  EventAnnouncement,
  EventItem,
  EventRegistration,
  RegistrationForm,
} from '@esport-sumbar/contracts';

@Injectable()
export class EventRepository {
  private readonly events = new Map<string, EventItem>();
  private readonly forms = new Map<string, RegistrationForm>();
  private readonly registrations = new Map<string, EventRegistration>();
  private readonly announcements = new Map<string, EventAnnouncement>();

  constructor() {
    this.seed();
  }

  private seed(): void {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const in9Days = new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString();
    const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const in16Days = new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000).toISOString();
    const in5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();

    const seedEvents: EventItem[] = [
      {
        id: 'evt-minangkabau-cup-2026',
        organizerId: 'user-eo-1',
        organizerName: 'Minang Pro Organizer',
        title: 'Minangkabau Esport Cup Season 4 — MLBB Championship',
        slug: 'minangkabau-esport-cup-season-4',
        description:
          'Turnamen kasta tertinggi Mobile Legends: Bang Bang tingkat Sumatera Barat. Babak kualifikasi online 18 kabupaten/kota menuju Grand Final Offline di Auditorium Universitas Andalas / GOR Prayoga Padang.',
        gameId: 'MLBB',
        scope: 'SUMBAR',
        mode: 'OFFLINE',
        location: 'GOR Prayoga Padang & Auditorium Unand',
        city: 'Padang',
        startAt: in7Days,
        endAt: in9Days,
        prizePool: 25_000_000,
        prizeDescription:
          'Juara 1: Rp 12.500.000 + Trofi Songket Emas · Juara 2: Rp 7.500.000 · Juara 3: Rp 3.500.000 · MVP: Rp 1.500.000',
        status: 'REGISTRATION_OPEN',
        bannerUrl: '/banners/minangkabau-cup-s4.webp',
        rulebookUrl: '/rulebooks/Rulebook_Minangkabau_Cup_S4_Resmi.pdf',
        isExternal: false,
        externalUrl: null,
        linkedCommunityIds: ['comm-mlbb-sumbar', 'comm-mlbb-padang'],
        participantType: 'TEAM',
        registeredCount: 3,
        quota: 32,
        createdAt: now.toISOString(),
      },
      {
        id: 'evt-val-campus-padang-2026',
        organizerId: 'user-eo-1',
        organizerName: 'Minang Pro Organizer',
        title: 'Valorant Campus & Highschool Series Sumbar 2026',
        slug: 'valorant-campus-series-sumbar-2026',
        description:
          'Kompetisi taktis 5v5 antar kampus dan SMA/SMK se-Sumatera Barat (Unand, UNP, UPI YPTK, PNP, Poltekes). Format Swiss Stage dilanjutkan Double Elimination.',
        gameId: 'VALORANT',
        scope: 'SUMBAR',
        mode: 'ONLINE',
        location: 'Discord Server Resmi & Custom Lobby SG-1',
        city: 'Padang',
        startAt: in14Days,
        endAt: in16Days,
        prizePool: 10_000_000,
        prizeDescription:
          'Juara 1: Rp 5.000.000 · Juara 2: Rp 3.000.000 · Juara 3: Rp 2.000.000',
        status: 'REGISTRATION_OPEN',
        bannerUrl: '/banners/valorant-campus-sumbar.webp',
        rulebookUrl: '/rulebooks/Rulebook_Valorant_Campus_2026.pdf',
        isExternal: false,
        externalUrl: null,
        linkedCommunityIds: ['comm-val-sumbar'],
        participantType: 'TEAM',
        registeredCount: 1,
        quota: 16,
        createdAt: now.toISOString(),
      },
      {
        id: 'evt-ff-bukittinggi-clash',
        organizerId: 'user-eo-2',
        organizerName: 'Bukittinggi Gaming Hub',
        title: 'Free Fire Jam Gadang Clash — Battle Royale Point Series',
        slug: 'free-fire-jam-gadang-clash-2026',
        description:
          'Turnamen offline Free Fire 12 Squad per lobby di jantung kota Bukittinggi. Menggunakan sistem poin placement + elims standar liga profesional.',
        gameId: 'FREE_FIRE',
        scope: 'SUMBAR',
        mode: 'OFFLINE',
        location: 'Lapangan Kantin Bukittinggi',
        city: 'Bukittinggi',
        startAt: now.toISOString(),
        endAt: in5Days,
        prizePool: 15_000_000,
        prizeDescription:
          'Juara 1: Rp 8.000.000 · Juara 2: Rp 4.500.000 · Predator Kill: Rp 2.500.000',
        status: 'ONGOING',
        bannerUrl: '/banners/ff-jam-gadang-clash.webp',
        rulebookUrl: '/rulebooks/Rulebook_FF_Bukittinggi.pdf',
        isExternal: false,
        externalUrl: null,
        linkedCommunityIds: ['comm-ff-sumbar', 'comm-ff-bukittinggi'],
        participantType: 'TEAM',
        registeredCount: 24,
        quota: 24,
        createdAt: now.toISOString(),
      },
      {
        id: 'evt-piala-presiden-sumatera',
        organizerId: 'user-admin-1',
        organizerName: 'Piala Presiden Esports (Kurasi Eksternal)',
        title: 'Kualifikasi Regional Sumatera — Piala Presiden Esports 2026',
        slug: 'piala-presiden-esports-kualifikasi-sumatera',
        description:
          'Kualifikasi terbuka regional Sumatera untuk memperebutkan slot Main Event Nasional di Jakarta.',
        gameId: 'MLBB',
        scope: 'NASIONAL',
        mode: 'ONLINE',
        location: 'Online Regional Sumatera',
        city: 'Nasional',
        startAt: in14Days,
        endAt: in16Days,
        prizePool: 150_000_000,
        prizeDescription: 'Total Prize Pool Rp 150.000.000 + Tiket Main Event Jakarta',
        status: 'REGISTRATION_OPEN',
        bannerUrl: null,
        rulebookUrl: null,
        isExternal: true,
        externalUrl: 'https://pialapresidenesports.id',
        linkedCommunityIds: ['comm-mlbb-sumbar'],
        participantType: 'TEAM',
        registeredCount: 64,
        quota: 128,
        createdAt: now.toISOString(),
      },
      {
        id: 'evt-vct-pacific-2026',
        organizerId: 'user-admin-1',
        organizerName: 'Riot Games APAC (Kurasi Global)',
        title: 'VCT Pacific Ascension Open Qualifier 2026',
        slug: 'vct-pacific-ascension-qualifier-2026',
        description:
          'Turnamen internasional kasta Tier-2 menuju promosi liga kemitraan VCT Pacific.',
        gameId: 'VALORANT',
        scope: 'GLOBAL',
        mode: 'ONLINE',
        location: 'Asia-Pacific Server',
        city: 'Global',
        startAt: now.toISOString(),
        endAt: in16Days,
        prizePool: 500_000_000,
        prizeDescription: 'USD 100,000 + Slot VCT Pacific League',
        status: 'ONGOING',
        bannerUrl: null,
        rulebookUrl: null,
        isExternal: true,
        externalUrl: 'https://valorantesports.com',
        linkedCommunityIds: ['comm-val-sumbar'],
        participantType: 'TEAM',
        registeredCount: 32,
        quota: 32,
        createdAt: now.toISOString(),
      },
    ];

    for (const evt of seedEvents) {
      this.events.set(evt.id, evt);
    }

    const seedForms: RegistrationForm[] = [
      {
        id: 'form-minangkabau-cup-2026',
        eventId: 'evt-minangkabau-cup-2026',
        quota: 32,
        deadline: in5Days,
        fee: 50_000,
        paymentInstructions:
          'Transfer biaya komitmen Rp 50.000 ke Bank Nagari 2100-0210-9988 a.n Minang Pro Organizer atau QRIS Resmi.',
        requirePaymentProof: true,
        updatedAt: now.toISOString(),
        fields: [
          {
            id: 'captainWhatsapp',
            label: 'Nomor WhatsApp Aktif Kapten',
            type: 'PHONE',
            required: true,
            placeholder: '0812xxxxxxxx',
          },
          {
            id: 'originCity',
            label: 'Kota/Kabupaten Asal Tim di Sumbar',
            type: 'SELECT',
            required: true,
            options: [
              'Padang',
              'Bukittinggi',
              'Payakumbuh',
              'Solok',
              'Pariaman',
              'Padang Panjang',
              'Sawahlunto',
              'Agam',
              'Tanah Datar',
              'Lima Puluh Kota',
            ],
          },
          {
            id: 'captainGameId',
            label: 'ID & Server MLBB Kapten (Contoh: 12345678 (1234))',
            type: 'GAME_ID',
            required: true,
            placeholder: '12345678 (1234)',
          },
          {
            id: 'discordTag',
            label: 'Username Discord Perwakilan Technical Meeting',
            type: 'TEXT',
            required: true,
            placeholder: 'namakapten#0001',
          },
        ],
      },
      {
        id: 'form-val-campus-padang-2026',
        eventId: 'evt-val-campus-padang-2026',
        quota: 16,
        deadline: in7Days,
        fee: 0,
        paymentInstructions: 'Pendaftaran GRATIS khusus mahasiswa/pelajar aktif Sumbar.',
        requirePaymentProof: false,
        updatedAt: now.toISOString(),
        fields: [
          {
            id: 'institutionName',
            label: 'Nama Kampus / Sekolah Asal',
            type: 'TEXT',
            required: true,
            placeholder: 'Universitas Andalas / UNP / SMAN 1 Padang',
          },
          {
            id: 'captainRiotId',
            label: 'Riot ID & Tagline Kapten (Contoh: Garuda#SMBR)',
            type: 'GAME_ID',
            required: true,
            placeholder: 'Nickname#TAG',
          },
          {
            id: 'captainWhatsapp',
            label: 'Nomor WhatsApp Kapten',
            type: 'PHONE',
            required: true,
            placeholder: '0812xxxxxxxx',
          },
        ],
      },
      {
        id: 'form-ff-bukittinggi-clash',
        eventId: 'evt-ff-bukittinggi-clash',
        quota: 24,
        deadline: in5Days,
        fee: 35_000,
        paymentInstructions: 'QRIS Bukittinggi Gaming Hub Rp 35.000 / Squad',
        requirePaymentProof: true,
        updatedAt: now.toISOString(),
        fields: [
          {
            id: 'captainFreeFireUid',
            label: 'UID Free Fire Kapten',
            type: 'GAME_ID',
            required: true,
            placeholder: '987654321',
          },
        ],
      },
    ];

    for (const form of seedForms) {
      this.forms.set(form.eventId, form);
    }

    const seedRegistrations: EventRegistration[] = [
      {
        id: 'reg-mlbb-1',
        eventId: 'evt-minangkabau-cup-2026',
        userId: 'user-member-1',
        userNickname: 'RianMinang',
        city: 'Padang',
        participantType: 'TEAM',
        teamName: 'Padang Roar Esports',
        teamMembers: [
          { nickname: 'RianMinang', gameId: '88192011 (2104)', role: 'Jungler' },
          { nickname: 'BimaGold', gameId: '77281920 (2101)', role: 'Gold Lane' },
          { nickname: 'FajriMid', gameId: '66172819 (2099)', role: 'Mid Lane' },
          { nickname: 'ZikriRoam', gameId: '55162718 (2088)', role: 'Roamer' },
          { nickname: 'AldoExp', gameId: '44152617 (2077)', role: 'EXP Lane' },
        ],
        communityId: 'comm-mlbb-sumbar',
        answers: {
          captainWhatsapp: '081266778899',
          originCity: 'Padang',
          captainGameId: '88192011 (2104)',
          discordTag: 'rianminang',
        },
        status: 'APPROVED',
        checkedIn: true,
        checkedInAt: now.toISOString(),
        proofFileId: 'file-proof-reg-1',
        proofFileUrl: '/api/media/files/file-proof-reg-1/signed-url',
        createdAt: now.toISOString(),
      },
      {
        id: 'reg-mlbb-2',
        eventId: 'evt-minangkabau-cup-2026',
        userId: 'user-member-2',
        userNickname: 'AgamSlayer',
        city: 'Bukittinggi',
        participantType: 'TEAM',
        teamName: 'Jam Gadang Reborn',
        teamMembers: [
          { nickname: 'AgamSlayer', gameId: '99182736 (2211)', role: 'Jungler' },
          { nickname: 'NandoMage', gameId: '99182737 (2211)', role: 'Mid Lane' },
          { nickname: 'RafiTank', gameId: '99182738 (2211)', role: 'Roamer' },
          { nickname: 'KikiMarksman', gameId: '99182739 (2211)', role: 'Gold Lane' },
          { nickname: 'DikaFighter', gameId: '99182740 (2211)', role: 'EXP Lane' },
        ],
        communityId: 'comm-mlbb-sumbar',
        answers: {
          captainWhatsapp: '081377889900',
          originCity: 'Bukittinggi',
          captainGameId: '99182736 (2211)',
          discordTag: 'agamslayer',
        },
        status: 'APPROVED',
        checkedIn: false,
        checkedInAt: null,
        proofFileId: 'file-proof-reg-2',
        proofFileUrl: '/api/media/files/file-proof-reg-2/signed-url',
        createdAt: now.toISOString(),
      },
      {
        id: 'reg-mlbb-3',
        eventId: 'evt-minangkabau-cup-2026',
        userId: 'user-member-3',
        userNickname: 'PayakumbuhKing',
        city: 'Payakumbuh',
        participantType: 'TEAM',
        teamName: 'Payakumbuh Bala Squad',
        teamMembers: [
          { nickname: 'PayakumbuhKing', gameId: '31291044 (9012)', role: 'Roamer' },
          { nickname: 'GilangCore', gameId: '31291045 (9012)', role: 'Jungler' },
          { nickname: 'WahyuGold', gameId: '31291046 (9012)', role: 'Gold Lane' },
          { nickname: 'RobbyExp', gameId: '31291047 (9012)', role: 'EXP Lane' },
          { nickname: 'IlhamMid', gameId: '31291048 (9012)', role: 'Mid Lane' },
        ],
        communityId: 'comm-mlbb-sumbar',
        answers: {
          captainWhatsapp: '082199001122',
          originCity: 'Payakumbuh',
          captainGameId: '31291044 (9012)',
          discordTag: 'pykking',
        },
        status: 'PENDING',
        checkedIn: false,
        checkedInAt: null,
        proofFileId: 'file-proof-reg-2',
        proofFileUrl: '/api/media/files/file-proof-reg-2/signed-url',
        createdAt: now.toISOString(),
      },
      {
        id: 'reg-mlbb-4',
        eventId: 'evt-minangkabau-cup-2026',
        userId: 'user-member-4',
        userNickname: 'SolokVanguard',
        city: 'Solok',
        participantType: 'TEAM',
        teamName: 'Solok Bareh Warriors',
        teamMembers: [
          { nickname: 'SolokVanguard', gameId: '54901283 (1192)', role: 'Jungler' },
          { nickname: 'RezaSniper', gameId: '54901284 (1192)', role: 'Gold Lane' },
          { nickname: 'HendraMage', gameId: '54901285 (1192)', role: 'Mid Lane' },
          { nickname: 'IqbalShield', gameId: '54901286 (1192)', role: 'Roamer' },
          { nickname: 'YudiOfflane', gameId: '54901287 (1192)', role: 'EXP Lane' },
        ],
        communityId: 'comm-mlbb-sumbar',
        answers: {
          captainWhatsapp: '085274112233',
          originCity: 'Solok',
          captainGameId: '54901283 (1192)',
          discordTag: 'solokvanguard',
        },
        status: 'WAITLIST',
        checkedIn: false,
        checkedInAt: null,
        proofFileId: null,
        proofFileUrl: null,
        createdAt: now.toISOString(),
      },
      {
        id: 'reg-val-1',
        eventId: 'evt-val-campus-padang-2026',
        userId: 'user-member-5',
        userNickname: 'UnandJett',
        city: 'Padang',
        participantType: 'TEAM',
        teamName: 'Andalas Tacticians',
        teamMembers: [
          { nickname: 'UnandJett', gameId: 'UnandJett#SMBR', role: 'Duelist' },
          { nickname: 'OmenLimau', gameId: 'OmenLimau#PDG', role: 'Controller' },
          { nickname: 'SovaJati', gameId: 'SovaJati#PDG', role: 'Initiator' },
          { nickname: 'KilljoyUnp', gameId: 'KilljoyUnp#01', role: 'Sentinel' },
          { nickname: 'ViperMinang', gameId: 'ViperMinang#99', role: 'Flex' },
        ],
        communityId: 'comm-val-sumbar',
        answers: {
          institutionName: 'Universitas Andalas',
          captainRiotId: 'UnandJett#SMBR',
          captainWhatsapp: '081288990011',
        },
        status: 'APPROVED',
        checkedIn: true,
        checkedInAt: now.toISOString(),
        proofFileId: null,
        proofFileUrl: null,
        createdAt: now.toISOString(),
      },
    ];

    for (const reg of seedRegistrations) {
      this.registrations.set(reg.id, reg);
    }

    const seedAnnouncements: EventAnnouncement[] = [
      {
        id: 'ann-mlbb-1',
        eventId: 'evt-minangkabau-cup-2026',
        organizerId: 'user-eo-1',
        title: 'Jadwal Technical Meeting & Check-In Ulang Discord',
        content:
          'Seluruh kapten tim yang berstatus APPROVED wajib hadir pada Technical Meeting di Discord Resmi pada H-2 pukul 19.30 WIB. Check-in dibuka 60 menit sebelum bracket dikunci.',
        important: true,
        createdAt: now.toISOString(),
      },
      {
        id: 'ann-mlbb-2',
        eventId: 'evt-minangkabau-cup-2026',
        organizerId: 'user-eo-1',
        title: 'Ketentuan Skin & Pause di Babak Kualifikasi',
        content:
          'Penggunaan skin diperbolehkan di seluruh mode Tournament Draft Pick. Masing-masing tim memiliki jatah tactical pause maksimal 2x3 menit dengan melapor ke wasit lobby.',
        important: false,
        createdAt: now.toISOString(),
      },
    ];

    for (const ann of seedAnnouncements) {
      this.announcements.set(ann.id, ann);
    }
  }

  findAllEvents(): EventItem[] {
    return Array.from(this.events.values());
  }

  findEventById(id: string): EventItem | undefined {
    return this.events.get(id);
  }

  findEventBySlugOrId(slugOrId: string): EventItem | undefined {
    const byId = this.events.get(slugOrId);
    if (byId) return byId;
    return Array.from(this.events.values()).find((e) => e.slug === slugOrId);
  }

  saveEvent(event: EventItem): EventItem {
    this.events.set(event.id, event);
    return event;
  }

  getFormByEventId(eventId: string): RegistrationForm | undefined {
    return this.forms.get(eventId);
  }

  saveForm(form: RegistrationForm): RegistrationForm {
    this.forms.set(form.eventId, form);
    return form;
  }

  getRegistrationsByEventId(eventId: string): EventRegistration[] {
    return Array.from(this.registrations.values()).filter(
      (r) => r.eventId === eventId,
    );
  }

  findRegistrationById(id: string): EventRegistration | undefined {
    return this.registrations.get(id);
  }

  saveRegistration(reg: EventRegistration): EventRegistration {
    this.registrations.set(reg.id, reg);
    return reg;
  }

  getAnnouncementsByEventId(eventId: string): EventAnnouncement[] {
    return Array.from(this.announcements.values())
      .filter((a) => a.eventId === eventId)
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  saveAnnouncement(ann: EventAnnouncement): EventAnnouncement {
    this.announcements.set(ann.id, ann);
    return ann;
  }
}
