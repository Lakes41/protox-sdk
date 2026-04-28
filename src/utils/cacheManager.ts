/**
 * Simple in-memory cache for RPC responses.
 */
export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  enabled?: boolean;
}

export class CacheManager {
  private cache: Map<string, { value: any; expiry: number }> = new Map();
  private defaultTtl: number;
  public enabled: boolean;

  constructor(options: CacheOptions = {}) {
    this.defaultTtl = options.ttl ?? 60000; // Default 1 minute
    this.enabled = options.enabled ?? true;
  }

  set(key: string, value: any, ttl?: number): void {
    if (!this.enabled) return;
    const expiry = Date.now() + (ttl ?? this.defaultTtl);
    this.cache.set(key, { value, expiry });
  }

  get<T>(key: string): T | null {
    if (!this.enabled) return null;
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}
