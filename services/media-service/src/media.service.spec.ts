import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { MediaService } from './media.service';

describe('MediaService (Event Storage, Tenant Isolation & Signed URLs)', () => {
  let service: MediaService;

  beforeEach(() => {
    service = new MediaService();
  });

  it('returns storage summary for the owning EO of an event', () => {
    const summary = service.getEventStorage('evt-minangkabau-cup-2026', 'user-eo-1');
    expect(summary.eventId).toBe('evt-minangkabau-cup-2026');
    expect(summary.organizerId).toBe('user-eo-1');
    expect(summary.files.length).toBeGreaterThanOrEqual(4);
    expect(summary.usedBytes).toBeGreaterThan(0);
  });

  it('enforces strict tenant isolation so EO B cannot view or upload to EO A storage', () => {
    expect(() =>
      service.getEventStorage('evt-minangkabau-cup-2026', 'user-eo-2', 'ORGANIZER'),
    ).toThrow(ForbiddenException);

    expect(() =>
      service.uploadFile({
        ownerId: 'user-eo-2',
        requesterRole: 'ORGANIZER',
        eventId: 'evt-minangkabau-cup-2026',
        fileName: 'unauthorized-poster.png',
        sizeBytes: 120_000,
        mimeType: 'image/png',
        category: 'POSTER',
      }),
    ).toThrow(ForbiddenException);
  });

  it('rejects dangerous file extensions and unsupported MIME types', () => {
    expect(() =>
      service.uploadFile({
        ownerId: 'user-eo-1',
        eventId: 'evt-minangkabau-cup-2026',
        fileName: 'malware.exe',
        sizeBytes: 50_000,
        mimeType: 'image/png',
        category: 'POSTER',
      }),
    ).toThrow(BadRequestException);

    expect(() =>
      service.uploadFile({
        ownerId: 'user-eo-1',
        eventId: 'evt-minangkabau-cup-2026',
        fileName: 'archive.zip',
        sizeBytes: 50_000,
        mimeType: 'application/zip',
        category: 'RULEBOOK',
      }),
    ).toThrow(BadRequestException);
  });

  it('generates and verifies HMAC-SHA256 signed URLs for private payment proofs', () => {
    const signed = service.generateSignedUrl(
      'file-proof-reg-1',
      'user-eo-1',
      'ORGANIZER',
      600,
    );
    expect(signed.signedUrl).toContain('/api/media/download/file-proof-reg-1');

    const urlObj = new URL(signed.signedUrl, 'http://localhost:4000');
    const expires = urlObj.searchParams.get('expires') || '';
    const sig = urlObj.searchParams.get('sig') || '';

    const verified = service.verifyAndDownload('file-proof-reg-1', expires, sig);
    expect(verified.valid).toBe(true);
    expect(verified.file.id).toBe('file-proof-reg-1');
  });

  it('prevents unauthorized third-party users from generating signed URLs for private files', () => {
    expect(() =>
      service.generateSignedUrl('file-proof-reg-1', 'user-stranger-99', 'USER'),
    ).toThrow(ForbiddenException);
  });
});
