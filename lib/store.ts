import { Redis } from '@upstash/redis';

export interface HashStore {
  getAll(key: string): Promise<Record<string, string>>;
  set(key: string, field: string, value: string): Promise<void>;
  del(key: string, field: string): Promise<void>;
}

class UpstashStore implements HashStore {
  constructor(private redis: Redis) {}

  async getAll(key: string) {
    const raw = await this.redis.hgetall<Record<string, unknown>>(key);
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw ?? {})) out[k] = String(v);
    return out;
  }

  async set(key: string, field: string, value: string) {
    await this.redis.hset(key, { [field]: value });
  }

  async del(key: string, field: string) {
    await this.redis.hdel(key, field);
  }
}

// 환경변수가 없을 때(로컬 개발)만 쓰는 메모리 저장소. 서버를 재시작하면 초기화됨.
class MemoryStore implements HashStore {
  private data: Map<string, Map<string, string>>;

  constructor() {
    const g = globalThis as unknown as { __smileVoteMem?: Map<string, Map<string, string>> };
    g.__smileVoteMem ??= new Map();
    this.data = g.__smileVoteMem;
  }

  async getAll(key: string) {
    return Object.fromEntries(this.data.get(key) ?? []);
  }

  async set(key: string, field: string, value: string) {
    if (!this.data.has(key)) this.data.set(key, new Map());
    this.data.get(key)!.set(field, value);
  }

  async del(key: string, field: string) {
    this.data.get(key)?.delete(field);
  }
}

let cached: HashStore | null = null;

export function getStore(): HashStore {
  if (cached) return cached;
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  cached = url && token ? new UpstashStore(new Redis({ url, token })) : new MemoryStore();
  return cached;
}

export function usingMemoryStore() {
  return getStore() instanceof MemoryStore;
}
