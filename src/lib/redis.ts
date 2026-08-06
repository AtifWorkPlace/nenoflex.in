// In-Memory Key-Value Redis Store Simulation
const redisCache = new Map<string, { value: any; expiresAt: number }>();

export const RedisService = {
  get: async <T>(key: string): Promise<T | null> => {
    const record = redisCache.get(key);
    if (!record) return null;
    if (Date.now() > record.expiresAt) {
      redisCache.delete(key);
      return null;
    }
    return record.value as T;
  },

  set: async (key: string, value: any, ttlSeconds = 300): Promise<void> => {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    redisCache.set(key, { value, expiresAt });
  },

  del: async (key: string): Promise<void> => {
    redisCache.delete(key);
  },

  // Session Cache Store
  setSession: async (sessionId: string, sessionData: any, ttlSeconds = 86400): Promise<void> => {
    await RedisService.set(`session:${sessionId}`, sessionData, ttlSeconds);
  },

  getSession: async (sessionId: string): Promise<any | null> => {
    return await RedisService.get(`session:${sessionId}`);
  },

  // Rate Limiting Counter
  incrRateLimit: async (ip: string, windowSeconds = 60): Promise<number> => {
    const key = `ratelimit:${ip}`;
    const current = (await RedisService.get<number>(key)) || 0;
    const next = current + 1;
    await RedisService.set(key, next, windowSeconds);
    return next;
  }
};
