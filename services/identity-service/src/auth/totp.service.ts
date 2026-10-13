import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function encodeBase32(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i]!;
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

export function decodeBase32(input: string): Buffer {
  const cleanInput = input.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleanInput.length; i++) {
    const char = cleanInput[i]!;
    const val = BASE32_ALPHABET.indexOf(char);
    if (val === -1) {
      throw new Error(`Karakter base32 tidak valid: ${char}`);
    }

    value = (value << 5) | val;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

@Injectable()
export class TotpService {
  /**
   * Menghasilkan rahasia TOTP acak 20 bytes (~32 karakter base32).
   */
  generateSecret(): string {
    const randomBytes = crypto.randomBytes(20);
    return encodeBase32(randomBytes);
  }

  /**
   * Menghasilkan kode TOTP 6 digit berdasarkan secret dan time (step = 30 detik).
   */
  generateTotp(secret: string, timeMs: number = Date.now()): string {
    const key = decodeBase32(secret);
    const counter = Math.floor(timeMs / 1000 / 30);

    const buf = Buffer.alloc(8);
    buf.writeBigInt64BE(BigInt(counter));

    const hmac = crypto.createHmac('sha1', key);
    hmac.update(buf);
    const digest = hmac.digest();

    const offset = digest[digest.length - 1]! & 0x0f;
    const code =
      ((digest[offset]! & 0x7f) << 24) |
      ((digest[offset + 1]! & 0xff) << 16) |
      ((digest[offset + 2]! & 0xff) << 8) |
      (digest[offset + 3]! & 0xff);

    const strCode = (code % 1000000).toString();
    return strCode.padStart(6, '0');
  }

  /**
   * Memvalidasi kode TOTP dengan toleransi jeda waktu ±1 interval (30 detik).
   */
  verifyTotp(token: string, secret: string, windowSteps: number = 1): boolean {
    if (!token || token.trim().length !== 6) return false;
    const cleanToken = token.trim();
    const now = Date.now();

    for (let step = -windowSteps; step <= windowSteps; step++) {
      const checkTime = now + step * 30 * 1000;
      const expected = this.generateTotp(secret, checkTime);
      if (crypto.timingSafeEqual(Buffer.from(cleanToken), Buffer.from(expected))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Menghasilkan URI otpauth standar untuk aplikasi authenticator (Google Auth / 1Password / Authy).
   */
  generateOtpAuthUrl(email: string, secret: string): string {
    const label = encodeURIComponent(`ESPORT SUMBAR:${email}`);
    const issuer = encodeURIComponent('ESPORT SUMBAR');
    return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
  }
}
