import { TotpService, encodeBase32, decodeBase32 } from './totp.service';

describe('TotpService', () => {
  let service: TotpService;

  beforeEach(() => {
    service = new TotpService();
  });

  it('should encode and decode base32 correctly', () => {
    const raw = Buffer.from('hello world', 'utf8');
    const encoded = encodeBase32(raw);
    const decoded = decodeBase32(encoded);
    expect(decoded.toString('utf8')).toBe('hello world');
  });

  it('should generate a 32-character base32 secret', () => {
    const secret = service.generateSecret();
    expect(typeof secret).toBe('string');
    expect(secret.length).toBe(32);
    expect(() => decodeBase32(secret)).not.toThrow();
  });

  it('should generate a 6-digit TOTP code', () => {
    const secret = service.generateSecret();
    const code = service.generateTotp(secret);
    expect(code).toMatch(/^\d{6}$/);
  });

  it('should verify a valid TOTP code', () => {
    const secret = service.generateSecret();
    const code = service.generateTotp(secret);
    expect(service.verifyTotp(code, secret)).toBe(true);
  });

  it('should reject an invalid TOTP code', () => {
    const secret = service.generateSecret();
    expect(service.verifyTotp('000000', secret)).toBe(false);
  });

  it('should generate a valid otpauth url', () => {
    const secret = service.generateSecret();
    const url = service.generateOtpAuthUrl('admin@esportsumbar.id', secret);
    expect(url).toContain('otpauth://totp/');
    expect(url).toContain('secret=' + secret);
    expect(url).toContain('issuer=ESPORT%20SUMBAR');
  });
});
