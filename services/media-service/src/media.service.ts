import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  EventStorageSummary,
  MediaFile,
  MediaFileCategory,
} from '@esport-sumbar/contracts';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/csv',
]);

const FORBIDDEN_EXTENSIONS = [
  '.exe',
  '.sh',
  '.bat',
  '.cmd',
  '.js',
  '.php',
  '.html',
  '.htm',
  '.svg',
];

const MAX_SINGLE_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const DEFAULT_EVENT_QUOTA_BYTES = 50 * 1024 * 1024; // 50 MB per event

export interface UploadMediaInput {
  ownerId: string;
  requesterRole?: string;
  eventId: string;
  organizerId?: string;
  fileName: string;
  sizeBytes: number;
  mimeType: string;
  category: MediaFileCategory;
  visibility?: 'PRIVATE' | 'PUBLIC';
}

@Injectable()
export class MediaService {
  private readonly secret =
    process.env.SIGNED_URL_SECRET || 'esport-sumbar-media-hmac-secret-key-2026';
  private readonly quotaBytes =
    Number(process.env.EVENT_STORAGE_QUOTA_BYTES) || DEFAULT_EVENT_QUOTA_BYTES;

  private readonly eventOwners = new Map<string, string>([
    ['evt-minangkabau-cup-2026', 'user-eo-1'],
    ['evt-val-campus-padang-2026', 'user-eo-1'],
    ['evt-ff-bukittinggi-clash', 'user-eo-2'],
  ]);

  private readonly files = new Map<string, MediaFile>();

  constructor() {
    this.seedInitialFiles();
  }

  private seedInitialFiles(): void {
    const now = new Date().toISOString();
    const seeded: MediaFile[] = [
      {
        id: 'file-poster-mlbb-2026',
        ownerId: 'user-eo-1',
        eventId: 'evt-minangkabau-cup-2026',
        fileName: 'poster-minangkabau-cup-s4.webp',
        key: 'events/user-eo-1/evt-minangkabau-cup-2026/POSTER/poster-minangkabau-cup-s4.webp',
        sizeBytes: 1_450_200,
        mimeType: 'image/webp',
        category: 'POSTER',
        visibility: 'PUBLIC',
        createdAt: now,
      },
      {
        id: 'file-rulebook-mlbb-2026',
        ownerId: 'user-eo-1',
        eventId: 'evt-minangkabau-cup-2026',
        fileName: 'Rulebook_Minangkabau_Cup_S4_Resmi.pdf',
        key: 'events/user-eo-1/evt-minangkabau-cup-2026/RULEBOOK/Rulebook_Minangkabau_Cup_S4_Resmi.pdf',
        sizeBytes: 3_840_512,
        mimeType: 'application/pdf',
        category: 'RULEBOOK',
        visibility: 'PUBLIC',
        createdAt: now,
      },
      {
        id: 'file-proof-reg-1',
        ownerId: 'user-member-1',
        eventId: 'evt-minangkabau-cup-2026',
        fileName: 'bukti-transfer-padang-roar.png',
        key: 'events/user-eo-1/evt-minangkabau-cup-2026/PAYMENT_PROOF/bukti-transfer-padang-roar.png',
        sizeBytes: 620_400,
        mimeType: 'image/png',
        category: 'PAYMENT_PROOF',
        visibility: 'PRIVATE',
        createdAt: now,
      },
      {
        id: 'file-proof-reg-2',
        ownerId: 'user-member-2',
        eventId: 'evt-minangkabau-cup-2026',
        fileName: 'bukti-qris-bukittinggi-esport.jpg',
        key: 'events/user-eo-1/evt-minangkabau-cup-2026/PAYMENT_PROOF/bukti-qris-bukittinggi-esport.jpg',
        sizeBytes: 512_900,
        mimeType: 'image/jpeg',
        category: 'PAYMENT_PROOF',
        visibility: 'PRIVATE',
        createdAt: now,
      },
    ];

    for (const file of seeded) {
      this.files.set(file.id, file);
    }
  }

  registerEventOwner(eventId: string, organizerId: string): void {
    this.eventOwners.set(eventId, organizerId);
  }

  private ensureTenantAccess(
    eventId: string,
    requesterId: string,
    requesterRole?: string,
  ): string {
    const owner = this.eventOwners.get(eventId);
    if (!owner) {
      // Register on first EO interaction if not mapped yet
      this.eventOwners.set(eventId, requesterId);
      return requesterId;
    }
    if (requesterRole !== 'ADMIN' && owner !== requesterId) {
      throw new ForbiddenException(
        `Tenant Isolation Error: EO '${requesterId}' tidak memiliki akses ke storage event '${eventId}' milik EO lain.`,
      );
    }
    return owner;
  }

  getEventStorage(
    eventId: string,
    requesterId: string,
    requesterRole?: string,
  ): EventStorageSummary {
    const organizerId = this.ensureTenantAccess(eventId, requesterId, requesterRole);
    const eventFiles = Array.from(this.files.values()).filter(
      (f) => f.eventId === eventId,
    );
    const usedBytes = eventFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
    const usagePercent = Math.min(
      100,
      Number(((usedBytes / this.quotaBytes) * 100).toFixed(2)),
    );

    return {
      eventId,
      organizerId,
      usedBytes,
      quotaBytes: this.quotaBytes,
      usagePercent,
      files: eventFiles.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    };
  }

  uploadFile(input: UploadMediaInput): MediaFile {
    const lowerName = input.fileName.toLowerCase().trim();
    if (!lowerName) {
      throw new BadRequestException('Nama file tidak boleh kosong');
    }

    for (const ext of FORBIDDEN_EXTENSIONS) {
      if (lowerName.endsWith(ext)) {
        throw new BadRequestException(
          `Ekstensi file '${ext}' dilarang demi keamanan storage.`,
        );
      }
    }

    if (!ALLOWED_MIME_TYPES.has(input.mimeType)) {
      throw new BadRequestException(
        `Tipe MIME '${input.mimeType}' tidak didukung. Gunakan PDF, JPEG, PNG, WebP, atau CSV.`,
      );
    }

    if (input.sizeBytes <= 0 || input.sizeBytes > MAX_SINGLE_FILE_BYTES) {
      throw new BadRequestException(
        `Ukuran file melampaui batas maksimal per file (10 MB).`,
      );
    }

    // Tenant check for EO-only categories
    const eoCategories: MediaFileCategory[] = ['POSTER', 'RULEBOOK', 'CSV_EXPORT'];
    let eventOrganizerId =
      this.eventOwners.get(input.eventId) || input.organizerId || input.ownerId;

    if (eoCategories.includes(input.category)) {
      eventOrganizerId = this.ensureTenantAccess(
        input.eventId,
        input.ownerId,
        input.requesterRole,
      );
    } else if (!this.eventOwners.has(input.eventId) && input.organizerId) {
      this.eventOwners.set(input.eventId, input.organizerId);
    }

    const currentUsed = Array.from(this.files.values())
      .filter((f) => f.eventId === input.eventId)
      .reduce((acc, f) => acc + f.sizeBytes, 0);

    if (currentUsed + input.sizeBytes > this.quotaBytes) {
      throw new BadRequestException(
        `Kuota storage event penuh (${Math.round(this.quotaBytes / (1024 * 1024))} MB). Hapus file lama terlebih dahulu.`,
      );
    }

    const safeFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const id = `file-${uuidv4().slice(0, 8)}`;
    const visibility =
      input.visibility ??
      (input.category === 'POSTER' || input.category === 'RULEBOOK'
        ? 'PUBLIC'
        : 'PRIVATE');

    const file: MediaFile = {
      id,
      ownerId: input.ownerId,
      eventId: input.eventId,
      fileName: safeFileName,
      key: `events/${eventOrganizerId}/${input.eventId}/${input.category}/${id}-${safeFileName}`,
      sizeBytes: input.sizeBytes,
      mimeType: input.mimeType,
      category: input.category,
      visibility,
      createdAt: new Date().toISOString(),
    };

    this.files.set(id, file);
    return file;
  }

  deleteFile(
    fileId: string,
    requesterId: string,
    requesterRole?: string,
  ): { deleted: boolean; fileId: string } {
    const file = this.files.get(fileId);
    if (!file) {
      throw new NotFoundException(`File '${fileId}' tidak ditemukan`);
    }

    this.ensureTenantAccess(file.eventId, requesterId, requesterRole);
    this.files.delete(fileId);
    return { deleted: true, fileId };
  }

  generateSignedUrl(
    fileId: string,
    requesterId: string,
    requesterRole?: string,
    expiresInSeconds = 900,
  ): {
    fileId: string;
    fileName: string;
    mimeType: string;
    signedUrl: string;
    expiresAt: string;
  } {
    const file = this.files.get(fileId);
    if (!file) {
      throw new NotFoundException(`File '${fileId}' tidak ditemukan`);
    }

    if (file.visibility === 'PRIVATE') {
      const eventOwner = this.eventOwners.get(file.eventId);
      const isAllowed =
        requesterRole === 'ADMIN' ||
        requesterId === file.ownerId ||
        requesterId === eventOwner;
      if (!isAllowed) {
        throw new ForbiddenException(
          'Akses ditolak: File privat hanya dapat diakses oleh pemilik file atau EO penyelenggara event.',
        );
      }
    }

    const expiresEpochMs = Date.now() + expiresInSeconds * 1000;
    const payload = `${file.id}:${expiresEpochMs}`;
    const sig = crypto
      .createHmac('sha256', this.secret)
      .update(payload)
      .digest('hex');

    return {
      fileId: file.id,
      fileName: file.fileName,
      mimeType: file.mimeType,
      signedUrl: `/api/media/download/${file.id}?expires=${expiresEpochMs}&sig=${sig}`,
      expiresAt: new Date(expiresEpochMs).toISOString(),
    };
  }

  verifyAndDownload(
    fileId: string,
    expires: string,
    sig: string,
  ): {
    valid: boolean;
    file: MediaFile;
  } {
    const file = this.files.get(fileId);
    if (!file) {
      throw new NotFoundException(`File '${fileId}' tidak ditemukan`);
    }

    const expiresMs = Number(expires);
    if (!expiresMs || Date.now() > expiresMs) {
      throw new ForbiddenException('Signed URL telah kedaluwarsa (expired).');
    }

    const expectedSig = crypto
      .createHmac('sha256', this.secret)
      .update(`${file.id}:${expiresMs}`)
      .digest('hex');

    if (sig !== expectedSig) {
      throw new ForbiddenException('Signature Signed URL tidak valid.');
    }

    return {
      valid: true,
      file,
    };
  }
}
