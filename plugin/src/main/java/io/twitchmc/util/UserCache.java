package io.twitchmc.util;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.UUID;

public class UserCache {
	private final HashMap<UUID, CacheEntry> cache = new HashMap<>();

	/**
	 * Check if a cache entry exists for this user & that it is not expired
	 * @param uuid User ID
	 * @return True if there was a valid cache entry, false if the entry was expired or missing.
	 */
	public boolean isUserCached(UUID uuid) {
		var entry = cache.get(uuid);
		if (entry == null) return false;

		if (!entry.isExpired()) {
			return true;
		} else {
			// Expired, remove
			cache.remove(uuid);
			return false;
		}
	}

	/**
	 * Mark a user as whitelisted for 24 hours
	 * @param uuid User ID
	 */
	public void cacheUser(UUID uuid) {
		cache.put(uuid, new CacheEntry(Instant.now()));
	}

	/**
	 * Clear all expired entries
	 */
	public void clearExpired() {
		cache.values().removeIf(CacheEntry::isExpired);
	}

	public record CacheEntry(Instant cacheTime) {
		public boolean isExpired() {
			return cacheTime.until(Instant.now(), ChronoUnit.HOURS) > 23;
		}
	}
}
