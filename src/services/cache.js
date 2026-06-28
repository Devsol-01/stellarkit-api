const NodeCache = require("node-cache");

/**
 * Centralised in-memory TTL cache service.
 * Used to cache Horizon responses and other frequently requested data.
 * Tracks hit/miss statistics for monitoring.
 */
class CacheService {
  constructor(defaultTtlSeconds = 60) {
    this.cache = new NodeCache({
      stdTTL: defaultTtlSeconds,
      checkperiod: defaultTtlSeconds * 0.2,
      useClones: false, // For performance since we're just caching JSON response data
    });
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get a value from the cache.
   * Logs a [CACHE HIT] or [CACHE MISS] at debug level.
   *
   * @param {string} key - Cache key
   * @returns {any|undefined} Cached value or undefined if missing/expired
   */
  get(key) {
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.hits++;
      if (process.env.NODE_ENV !== "test") {
        console.debug(`[CACHE HIT] ${key}`);
      }
      return value;
    }
    this.misses++;
    if (process.env.NODE_ENV !== "test") {
      console.debug(`[CACHE MISS] ${key}`);
    }
    return undefined;
  }

  /**
   * Set a value in the cache with a specific TTL.
   *
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlSeconds - TTL in seconds
   * @returns {boolean} True if successfully set
   */
  set(key, value, ttlSeconds) {
    return this.cache.set(key, value, ttlSeconds);
  }

  /**
   * Delete a specific key from the cache.
   *
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.del(key);
  }

  /**
   * Flush all data from the cache.
   */
  flush() {
    this.cache.flushAll();
  }

  /**
   * Return cache performance statistics.
   *
   * @returns {{ hits: number, misses: number, hitRate: string, cachedKeys: number }}
   */
  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? ((this.hits / total) * 100).toFixed(2) : "0.00";
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: `${hitRate}%`,
      cachedKeys: this.cache.keys().length,
    };
  }
}

// Export a singleton instance
module.exports = new CacheService();
