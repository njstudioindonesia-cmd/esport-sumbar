import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(() => {
    service = new PasswordService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hash a password with argon2id and verify correctly', async () => {
    const raw = 'PasswordKu123!';
    const hash = await service.hash(raw);

    expect(hash).toBeDefined();
    expect(hash).toContain('$argon2id$');

    const isValid = await service.verify(hash, raw);
    expect(isValid).toBe(true);

    const isInvalid = await service.verify(hash, 'SalahPassword123!');
    expect(isInvalid).toBe(false);
  });
});
