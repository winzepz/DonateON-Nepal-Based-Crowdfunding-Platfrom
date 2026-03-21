import { logger } from '../utils/logger';
import Redis from 'ioredis';

/**
 * CacheService provides an abstraction for key-value storage.
 * In production, this would connect to a Redis instance.
 */
class CacheService {
  private redisClient: Redis | null = null;
  private memoryCache: Map<string, { value: any, expiresAt: number }> = new Map();

  constructor() {
    if (process.env.REDIS_URL) {
      this.redisClient = new Redis(process.env.REDIS_URL);
      logger.info('cache.redis_connected');
      
      this.redisClient.on('error', (err) => {
          logger.error('cache.redis_error', { error: err.message });
      });
    } else {
      logger.info('cache.memory_mode_active');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.redisClient) {
        try {
            const data = await this.redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } catch (err: any) {
            logger.error('cache.get_error', { key, error: err.message });
            return null; // Fallback to missing instead of crashing app
        }
    }

    // Memory Fallback
    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
        this.memoryCache.delete(key);
        return null;
    }
    return item.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    if (this.redisClient) {
        try {
            await this.redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        } catch (err: any) {
            logger.error('cache.set_error', { key, error: err.message });
        }
        return;
    }

    // Memory Fallback
    this.memoryCache.set(key, {
        value,
        expiresAt: Date.now() + (ttlSeconds * 1000)
    });
  }

  async del(key: string): Promise<void> {
    if (this.redisClient) {
        try {
            await this.redisClient.del(key);
        } catch (err: any) {
            logger.error('cache.del_error', { key, error: err.message });
        }
        return;
    }
    
    // Memory fallback
    this.memoryCache.delete(key);
  }

  /**
   * Generates a cache key for campaign details
   */
  getCampaignKey(id: string) {
    return `campaign:${id}`;
  }

  /**
   * Generates a cache key for global stats
   */
  getStatsKey() {
    return `stats:global:summary`;
  }
}

export const cacheService = new CacheService();
