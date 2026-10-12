import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  EventAnnouncement,
  EventItem,
  EventMode,
  EventRegistration,
  EventScope,
  EventStatus,
  FormField,
  ParticipantType,
  RegistrationForm,
  RegistrationStatus,
  TeamMember,
} from '@esport-sumbar/contracts';
import { EventRepository } from './database/event.repository';

function slugifyText(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface CreateEventDto {
  title: string;
  description: string;
  gameId: string;
  scope: EventScope;
  mode: EventMode;
  location?: string;
  city?: string;
  startAt: string;
  endAt: string;
  prizePool: number;
  prizeDescription?: string;
  participantType?: ParticipantType;
  quota?: number;
  fee?: number;
  linkedCommunityIds?: string[];
}

export interface SubmitRegistrationDto {
  userId: string;
  userNickname: string;
  city?: string;
  participantType: 'INDIVIDUAL' | 'TEAM';
  teamName?: string;
  teamMembers?: TeamMember[];
  communityId?: string;
  answers: Record<string, unknown>;
  proofFileId?: string | null;
  proofFileUrl?: string | null;
}

@Injectable()
export class EventService {
  constructor(private readonly repo: EventRepository) {}

  /**
   * Strict Tenant Isolation Check:
   * Ensures EO A cannot access or mutate EO B's events, forms, participants, or announcements.
   */
  public ensureEventOwnership(
    eventIdOrSlug: string,
    organizerId: string,
    role?: string,
  ): EventItem {
    const event = this.repo.findEventBySlugOrId(eventIdOrSlug);
    if (!event) {
      throw new NotFoundException(`Event '${eventIdOrSlug}' tidak ditemukan`);
    }

    if (role !== 'ADMIN' && event.organizerId !== organizerId) {
      throw new ForbiddenException(
        `Tenant Isolation Violation: EO '${organizerId}' tidak memiliki izin mengakses event '${event.title}' milik EO '${event.organizerId}'.`,
      );
    }

    return event;
  }

  listPublicEvents(filters?: {
    scope?: string;
    gameId?: string;
    mode?: string;
    status?: string;
    search?: string;
    communityId?: string;
  }): EventItem[] {
    let items = this.repo
      .findAllEvents()
      .filter((e) => e.status !== 'DRAFT' && e.status !== 'CANCELLED');

    const scopeFilter = filters?.scope;
    if (scopeFilter && scopeFilter !== 'ALL') {
      const upperScope = scopeFilter.toUpperCase();
      items = items.filter((e) => e.scope === upperScope);
    }

    const gameFilter = filters?.gameId;
    if (gameFilter && gameFilter !== 'ALL') {
      const upperGame = gameFilter.toUpperCase();
      items = items.filter((e) => e.gameId.toUpperCase() === upperGame);
    }

    const modeFilter = filters?.mode;
    if (modeFilter && modeFilter !== 'ALL') {
      const upperMode = modeFilter.toUpperCase();
      items = items.filter((e) => e.mode === upperMode);
    }

    const statusFilter = filters?.status;
    if (statusFilter && statusFilter !== 'ALL') {
      const upperStatus = statusFilter.toUpperCase();
      items = items.filter((e) => e.status === upperStatus);
    }

    const communityFilter = filters?.communityId;
    if (communityFilter) {
      items = items.filter((e) =>
        (e.linkedCommunityIds ?? []).includes(communityFilter),
      );
    }
    if (filters?.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      items = items.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.description ?? '').toLowerCase().includes(q) ||
          (e.city && e.city.toLowerCase().includes(q)) ||
          (e.location && e.location.toLowerCase().includes(q)),
      );
    }

    return items.sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    );
  }

  getEventDetail(slugOrId: string) {
    const event = this.repo.findEventBySlugOrId(slugOrId);
    if (!event) {
      throw new NotFoundException(`Event '${slugOrId}' tidak ditemukan`);
    }

    const form = this.getOrCreateDefaultForm(event);
    const allRegs = this.repo.getRegistrationsByEventId(event.id);
    const approvedParticipants = allRegs.filter((r) => r.status === 'APPROVED');
    const announcements = this.repo.getAnnouncementsByEventId(event.id);

    const cityDistribution: Record<string, number> = {};
    for (const r of allRegs) {
      const city = r.city || (r.answers['originCity'] as string) || 'Lainnya';
      cityDistribution[city] = (cityDistribution[city] || 0) + 1;
    }

    return {
      event: {
        ...event,
        registeredCount: approvedParticipants.length,
      },
      form,
      participants: approvedParticipants,
      totalApplicants: allRegs.length,
      announcements,
      analytics: {
        totalApplicants: allRegs.length,
        approvedCount: approvedParticipants.length,
        pendingCount: allRegs.filter((r) => r.status === 'PENDING').length,
        waitlistCount: allRegs.filter((r) => r.status === 'WAITLIST').length,
        checkedInCount: allRegs.filter((r) => r.checkedIn).length,
        cityDistribution,
      },
    };
  }

  private getOrCreateDefaultForm(event: EventItem): RegistrationForm {
    const existing = this.repo.getFormByEventId(event.id);
    if (existing) return existing;

    const created: RegistrationForm = {
      id: `form-${event.id}`,
      eventId: event.id,
      quota: event.quota ?? 32,
      deadline: event.startAt,
      fee: 0,
      paymentInstructions: 'Pendaftaran gratis.',
      requirePaymentProof: false,
      updatedAt: new Date().toISOString(),
      fields: [
        {
          id: 'captainWhatsapp',
          label: 'Nomor WhatsApp Aktif',
          type: 'PHONE',
          required: true,
          placeholder: '0812xxxxxxxx',
        },
        {
          id: 'captainGameId',
          label: `ID In-Game (${event.gameId})`,
          type: 'GAME_ID',
          required: true,
          placeholder: 'Masukkan ID akun game',
        },
      ],
    };
    return this.repo.saveForm(created);
  }

  /**
   * Validates user answers dynamically against the event's RegistrationForm JSON schema
   */
  public validateDynamicAnswers(
    form: RegistrationForm,
    dto: SubmitRegistrationDto,
  ): void {
    if (dto.participantType === 'TEAM') {
      if (!dto.teamName || dto.teamName.trim().length < 3) {
        throw new BadRequestException(
          'Nama tim wajib diisi (minimal 3 karakter) untuk pendaftaran tim.',
        );
      }
      if (!dto.teamMembers || dto.teamMembers.length === 0) {
        throw new BadRequestException(
          'Minimal cantumkan 1 anggota roster utama pada pendaftaran tim.',
        );
      }
    }

    for (const field of form.fields) {
      const rawValue = dto.answers?.[field.id];
      const strValue =
        typeof rawValue === 'string'
          ? rawValue.trim()
          : rawValue !== undefined && rawValue !== null
            ? String(rawValue).trim()
            : '';

      if (field.required && !strValue) {
        throw new BadRequestException(
          `Field wajib belum diisi: "${field.label}"`,
        );
      }

      if (
        strValue &&
        field.type === 'SELECT' &&
        field.options &&
        field.options.length > 0
      ) {
        if (!field.options.includes(strValue)) {
          throw new BadRequestException(
            `Pilihan "${strValue}" tidak valid untuk field "${field.label}". Pilihan yang tersedia: ${field.options.join(', ')}`,
          );
        }
      }

      if (strValue && field.type === 'PHONE') {
        if (!/^[0-9+ -]{9,16}$/.test(strValue)) {
          throw new BadRequestException(
            `Format nomor telepon pada "${field.label}" tidak valid.`,
          );
        }
      }
    }

    if (form.requirePaymentProof && form.fee > 0 && !dto.proofFileId && !dto.proofFileUrl) {
      throw new BadRequestException(
        'Event berbayar ini mewajibkan upload bukti pembayaran.',
      );
    }
  }

  submitRegistration(
    slugOrId: string,
    dto: SubmitRegistrationDto,
  ): EventRegistration {
    const event = this.repo.findEventBySlugOrId(slugOrId);
    if (!event) {
      throw new NotFoundException(`Event '${slugOrId}' tidak ditemukan`);
    }

    if (event.status !== 'REGISTRATION_OPEN') {
      throw new BadRequestException(
        `Pendaftaran untuk event "${event.title}" sedang tidak dibuka (Status: ${event.status}).`,
      );
    }

    const form = this.getOrCreateDefaultForm(event);

    if (new Date(form.deadline).getTime() < Date.now()) {
      throw new BadRequestException(
        'Batas waktu pendaftaran untuk event ini telah berakhir.',
      );
    }

    const existingRegs = this.repo.getRegistrationsByEventId(event.id);
    const duplicateUser = existingRegs.find(
      (r) => r.userId === dto.userId && r.status !== 'REJECTED',
    );
    if (duplicateUser) {
      throw new ConflictException(
        'Anda sudah terdaftar pada event ini. Pantau status pendaftaran Anda.',
      );
    }

    if (dto.teamName) {
      const duplicateTeam = existingRegs.find(
        (r) =>
          r.teamName?.toLowerCase() === dto.teamName!.trim().toLowerCase() &&
          r.status !== 'REJECTED',
      );
      if (duplicateTeam) {
        throw new ConflictException(
          `Tim dengan nama "${dto.teamName}" sudah terdaftar pada event ini.`,
        );
      }
    }

    this.validateDynamicAnswers(form, dto);

    const approvedCount = existingRegs.filter(
      (r) => r.status === 'APPROVED',
    ).length;

    const initialStatus: RegistrationStatus =
      approvedCount >= form.quota ? 'WAITLIST' : 'PENDING';

    const registration: EventRegistration = {
      id: `reg-${uuidv4().slice(0, 8)}`,
      eventId: event.id,
      userId: dto.userId,
      userNickname: dto.userNickname,
      city:
        dto.city ||
        (typeof dto.answers?.['originCity'] === 'string'
          ? dto.answers['originCity']
          : 'Padang'),
      participantType: dto.participantType,
      teamName: dto.teamName?.trim(),
      teamMembers: dto.teamMembers ?? [],
      communityId: dto.communityId,
      answers: dto.answers ?? {},
      status: initialStatus,
      checkedIn: false,
      checkedInAt: null,
      proofFileId: dto.proofFileId ?? null,
      proofFileUrl: dto.proofFileUrl ?? null,
      createdAt: new Date().toISOString(),
    };

    return this.repo.saveRegistration(registration);
  }

  // ==================== EO TOOLS & TENANT-ISOLATED METHODS ====================

  listEoDashboard(organizerId: string, role?: string) {
    const allEvents = this.repo.findAllEvents();
    const eoEvents =
      role === 'ADMIN'
        ? allEvents
        : allEvents.filter((e) => e.organizerId === organizerId);

    let totalApplicants = 0;
    let totalApproved = 0;
    let totalPending = 0;
    const cityStats: Record<string, number> = {};

    const enrichedEvents = eoEvents.map((evt) => {
      const regs = this.repo.getRegistrationsByEventId(evt.id);
      const approved = regs.filter((r) => r.status === 'APPROVED').length;
      const pending = regs.filter((r) => r.status === 'PENDING').length;
      const waitlist = regs.filter((r) => r.status === 'WAITLIST').length;

      totalApplicants += regs.length;
      totalApproved += approved;
      totalPending += pending;

      for (const r of regs) {
        const city = r.city || (r.answers['originCity'] as string) || 'Lainnya';
        cityStats[city] = (cityStats[city] || 0) + 1;
      }

      return {
        ...evt,
        registeredCount: approved,
        stats: {
          totalApplicants: regs.length,
          approved,
          pending,
          waitlist,
          checkedIn: regs.filter((r) => r.checkedIn).length,
        },
      };
    });

    return {
      organizerId,
      summary: {
        totalEvents: eoEvents.length,
        totalApplicants,
        totalApproved,
        totalPending,
        cityStats,
      },
      events: enrichedEvents,
    };
  }

  getEoEventManagement(eventId: string, organizerId: string, role?: string) {
    const event = this.ensureEventOwnership(eventId, organizerId, role);
    const form = this.getOrCreateDefaultForm(event);
    const registrations = this.repo.getRegistrationsByEventId(event.id);
    const announcements = this.repo.getAnnouncementsByEventId(event.id);

    const cityBreakdown: Record<string, number> = {};
    for (const r of registrations) {
      const city = r.city || (r.answers['originCity'] as string) || 'Lainnya';
      cityBreakdown[city] = (cityBreakdown[city] || 0) + 1;
    }

    return {
      event: {
        ...event,
        registeredCount: registrations.filter((r) => r.status === 'APPROVED').length,
      },
      form,
      registrations,
      announcements,
      analytics: {
        totalApplicants: registrations.length,
        approved: registrations.filter((r) => r.status === 'APPROVED').length,
        pending: registrations.filter((r) => r.status === 'PENDING').length,
        waitlist: registrations.filter((r) => r.status === 'WAITLIST').length,
        rejected: registrations.filter((r) => r.status === 'REJECTED').length,
        checkedIn: registrations.filter((r) => r.checkedIn).length,
        cityBreakdown,
      },
    };
  }

  createEvent(
    organizerId: string,
    organizerName: string,
    dto: CreateEventDto,
  ): { event: EventItem; form: RegistrationForm } {
    if (!dto.title || dto.title.trim().length < 5) {
      throw new BadRequestException('Judul event minimal 5 karakter');
    }

    const baseSlug = slugifyText(dto.title);
    const id = `evt-${uuidv4().slice(0, 8)}`;
    const slug = this.repo.findEventBySlugOrId(baseSlug)
      ? `${baseSlug}-${id.slice(-4)}`
      : baseSlug;

    const now = new Date().toISOString();
    const quota = dto.quota && dto.quota > 0 ? dto.quota : 32;

    const event: EventItem = {
      id,
      organizerId,
      organizerName: organizerName || 'EO Esport Sumbar',
      title: dto.title.trim(),
      slug,
      description: dto.description?.trim() || '',
      gameId: (dto.gameId || 'MLBB').toUpperCase(),
      scope: dto.scope || 'SUMBAR',
      mode: dto.mode || 'OFFLINE',
      location: dto.location || 'Sumatera Barat',
      city: dto.city || 'Padang',
      startAt: dto.startAt || new Date(Date.now() + 7 * 86400000).toISOString(),
      endAt: dto.endAt || new Date(Date.now() + 9 * 86400000).toISOString(),
      prizePool: Number(dto.prizePool) || 0,
      prizeDescription: dto.prizeDescription || '',
      status: 'REGISTRATION_OPEN',
      bannerUrl: null,
      rulebookUrl: null,
      isExternal: false,
      externalUrl: null,
      linkedCommunityIds: dto.linkedCommunityIds ?? [],
      participantType: dto.participantType || 'TEAM',
      registeredCount: 0,
      quota,
      createdAt: now,
    };

    this.repo.saveEvent(event);

    const fee = Number(dto.fee) || 0;
    const form: RegistrationForm = {
      id: `form-${id}`,
      eventId: id,
      quota,
      deadline: event.startAt,
      fee,
      paymentInstructions:
        fee > 0
          ? `Transfer biaya pendaftaran Rp ${fee.toLocaleString('id-ID')} ke rekening panitia.`
          : 'Pendaftaran gratis.',
      requirePaymentProof: fee > 0,
      updatedAt: now,
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
          label: 'Kota/Kabupaten Asal di Sumatera Barat',
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
          ],
        },
        {
          id: 'captainGameId',
          label: `ID In-Game (${event.gameId})`,
          type: 'GAME_ID',
          required: true,
          placeholder: 'Masukkan ID & Server Game',
        },
      ],
    };

    this.repo.saveForm(form);
    return { event, form };
  }

  updateEvent(
    eventId: string,
    organizerId: string,
    role: string | undefined,
    patch: Partial<EventItem>,
  ): EventItem {
    const existing = this.ensureEventOwnership(eventId, organizerId, role);
    const updated: EventItem = {
      ...existing,
      title: patch.title ?? existing.title,
      description: patch.description ?? existing.description,
      gameId: patch.gameId ?? existing.gameId,
      scope: patch.scope ?? existing.scope,
      mode: patch.mode ?? existing.mode,
      location: patch.location !== undefined ? patch.location : existing.location,
      city: patch.city !== undefined ? patch.city : existing.city,
      startAt: patch.startAt ?? existing.startAt,
      endAt: patch.endAt ?? existing.endAt,
      prizePool:
        patch.prizePool !== undefined ? Number(patch.prizePool) : existing.prizePool,
      prizeDescription: patch.prizeDescription ?? existing.prizeDescription,
      status: patch.status ?? existing.status,
      bannerUrl: patch.bannerUrl !== undefined ? patch.bannerUrl : existing.bannerUrl,
      rulebookUrl:
        patch.rulebookUrl !== undefined ? patch.rulebookUrl : existing.rulebookUrl,
      quota: patch.quota !== undefined ? Number(patch.quota) : existing.quota,
    };

    return this.repo.saveEvent(updated);
  }

  updateRegistrationForm(
    eventId: string,
    organizerId: string,
    role: string | undefined,
    dto: {
      fields?: FormField[];
      quota?: number;
      deadline?: string;
      fee?: number;
      paymentInstructions?: string;
      requirePaymentProof?: boolean;
    },
  ): RegistrationForm {
    const event = this.ensureEventOwnership(eventId, organizerId, role);
    const current = this.getOrCreateDefaultForm(event);

    const updated: RegistrationForm = {
      ...current,
      fields: dto.fields ?? current.fields,
      quota: dto.quota !== undefined ? Number(dto.quota) : current.quota,
      deadline: dto.deadline ?? current.deadline,
      fee: dto.fee !== undefined ? Number(dto.fee) : current.fee,
      paymentInstructions:
        dto.paymentInstructions !== undefined
          ? dto.paymentInstructions
          : current.paymentInstructions,
      requirePaymentProof:
        dto.requirePaymentProof !== undefined
          ? Boolean(dto.requirePaymentProof)
          : current.requirePaymentProof,
      updatedAt: new Date().toISOString(),
    };

    if (dto.quota !== undefined && dto.quota !== event.quota) {
      this.repo.saveEvent({
        ...event,
        quota: Number(dto.quota),
      });
    }

    return this.repo.saveForm(updated);
  }

  updateParticipantStatus(
    eventId: string,
    registrationId: string,
    organizerId: string,
    role: string | undefined,
    body: { status: RegistrationStatus; rejectionReason?: string },
  ): EventRegistration {
    const event = this.ensureEventOwnership(eventId, organizerId, role);
    const reg = this.repo.findRegistrationById(registrationId);

    if (!reg || reg.eventId !== event.id) {
      throw new NotFoundException(
        `Data pendaftaran '${registrationId}' tidak ditemukan pada event ini.`,
      );
    }

    const updated: EventRegistration = {
      ...reg,
      status: body.status,
      rejectionReason: body.rejectionReason,
    };
    this.repo.saveRegistration(updated);

    const allApproved = this.repo
      .getRegistrationsByEventId(event.id)
      .filter((r) => r.status === 'APPROVED').length;

    this.repo.saveEvent({
      ...event,
      registeredCount: allApproved,
    });

    return updated;
  }

  toggleParticipantCheckIn(
    eventId: string,
    registrationId: string,
    organizerId: string,
    role: string | undefined,
  ): EventRegistration {
    const event = this.ensureEventOwnership(eventId, organizerId, role);
    const reg = this.repo.findRegistrationById(registrationId);

    if (!reg || reg.eventId !== event.id) {
      throw new NotFoundException(
        `Data pendaftaran '${registrationId}' tidak ditemukan pada event ini.`,
      );
    }

    const nextChecked = !reg.checkedIn;
    const updated: EventRegistration = {
      ...reg,
      checkedIn: nextChecked,
      checkedInAt: nextChecked ? new Date().toISOString() : null,
    };

    return this.repo.saveRegistration(updated);
  }

  exportParticipantsCsv(
    eventId: string,
    organizerId: string,
    role: string | undefined,
  ): {
    eventId: string;
    fileName: string;
    totalRows: number;
    csvContent: string;
  } {
    const event = this.ensureEventOwnership(eventId, organizerId, role);
    const form = this.getOrCreateDefaultForm(event);
    const registrations = this.repo.getRegistrationsByEventId(event.id);

    const escapeCsv = (val: unknown): string => {
      const str =
        val === null || val === undefined
          ? ''
          : typeof val === 'object'
            ? JSON.stringify(val)
            : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const dynamicFieldHeaders = form.fields.map((f) => f.label);
    const headers = [
      'ID Pendaftaran',
      'Waktu Daftar',
      'Tipe Peserta',
      'Nama Tim',
      'Kapten / Pendaftar',
      'Kota Asal',
      'Status',
      'Check-In',
      'Roster Anggota',
      ...dynamicFieldHeaders,
    ];

    const rows = registrations.map((reg) => {
      const rosterSummary = (reg.teamMembers || [])
        .map((m) => `${m.nickname} (${m.gameId})`)
        .join(' | ');
      const dynamicValues = form.fields.map((f) => reg.answers?.[f.id] ?? '');

      return [
        reg.id,
        reg.createdAt,
        reg.participantType,
        reg.teamName || '-',
        reg.userNickname,
        reg.city || '-',
        reg.status,
        reg.checkedIn ? 'SUDAH CHECK-IN' : 'BELUM',
        rosterSummary,
        ...dynamicValues,
      ]
        .map(escapeCsv)
        .join(',');
    });

    const csvContent = [headers.map(escapeCsv).join(','), ...rows].join('\n');

    return {
      eventId: event.id,
      fileName: `peserta-${event.slug}.csv`,
      totalRows: registrations.length,
      csvContent,
    };
  }

  createAnnouncement(
    eventId: string,
    organizerId: string,
    role: string | undefined,
    dto: { title: string; content: string; important?: boolean },
  ): EventAnnouncement {
    const event = this.ensureEventOwnership(eventId, organizerId, role);
    if (!dto.title?.trim() || !dto.content?.trim()) {
      throw new BadRequestException('Judul dan isi pengumuman wajib diisi');
    }

    const ann: EventAnnouncement = {
      id: `ann-${uuidv4().slice(0, 8)}`,
      eventId: event.id,
      organizerId,
      title: dto.title.trim(),
      content: dto.content.trim(),
      important: Boolean(dto.important),
      createdAt: new Date().toISOString(),
    };

    return this.repo.saveAnnouncement(ann);
  }
}
