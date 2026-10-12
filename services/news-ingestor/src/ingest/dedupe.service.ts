import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class DedupeService {
  private readonly processedHashes: Set<string> = new Set();

  hash(url: string, title: string): string {
    const normalized = `${url.trim().toLowerCase()}||${title.trim().toLowerCase()}`;
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  isDuplicate(url: string, title: string): boolean {
    const h = this.hash(url, title);
    return this.processedHashes.has(h);
  }

  markProcessed(url: string, title: string): void {
    const h = this.hash(url, title);
    this.processedHashes.add(h);
  }

  getProcessedCount(): number {
    return this.processedHashes.size;
  }

  clear(): void {
    this.processedHashes.clear();
  }
}
