package io.twitchmc;

import io.twitchmc.floodgate.PlayerMap;
import io.twitchmc.http.ApiClient;
import io.twitchmc.util.UserCache;
import net.milkbowl.vault.permission.Permission;
import org.bukkit.Bukkit;
import org.bukkit.OfflinePlayer;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.AsyncPlayerPreLoginEvent;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

public class PlayerListener implements Listener {
	private final ApiClient apiClient;
	private final ConfigHolder configHolder;
	private final Logger logger;
	private final PlayerMap playerMap;
	private final UserCache userCache;
	private Permission permissionApi;

	public PlayerListener(ApiClient apiClient, ConfigHolder configHolder, Logger logger, PlayerMap playerMap) {
		this.apiClient = apiClient;
		this.configHolder = configHolder;
		this.logger = logger;
		this.playerMap = playerMap;
		this.userCache = new UserCache();

		this.permissionApi = Bukkit.getServicesManager().load(Permission.class);
	}

	private boolean canPlayerBypass(OfflinePlayer player) {
		if (permissionApi != null) {
			return permissionApi.playerHas(null, player, "twitchmc.bypass");
		} else {
			return player.isOp();
		}
	}

	@EventHandler
	public void onPlayerJoin(AsyncPlayerPreLoginEvent event) {
		try {
			this.tryPlayerJoin(event);
		} catch (Throwable t) {
			event.disallow(AsyncPlayerPreLoginEvent.Result.KICK_OTHER,
					"Error checking access permissions - please contact a server admin");
			throw t;
		}
	}

	public void tryPlayerJoin(AsyncPlayerPreLoginEvent event) {
		var uuid = playerMap.getMappedUUID(event.getUniqueId());
		var offlinePlayer = Bukkit.getOfflinePlayer(uuid);

		if (canPlayerBypass(offlinePlayer)) {
			event.allow();
			return;
		}

		logger.info("%s has joined, checking access".formatted(uuid));

		boolean isServerVerified = !configHolder.getServerId().isBlank();

		if (!isServerVerified) {
			event.disallow(AsyncPlayerPreLoginEvent.Result.KICK_OTHER,
					"This server has not been verified with TwitchMC yet. Please contact a server admin - or if you are a server admin, head to https://twitchmc.io/servers");
			return;
		}

		if (userCache.isUserCached(uuid)) {
			event.allow();
			return;
		}

		try {
			var result = apiClient.checkAccess(uuid.toString(), configHolder.getServerId());

			if (result.access()) {
				userCache.cacheUser(uuid);
				event.allow();
			} else {
				var message = result.description();
				if (message == null) {
					logger.warning("Missing error message from server for access = false response");
					message = "Missing error message from server - please report this to TwitchMC";
				}

				if (result.hasError()) {
					logger.info("Login for %s failed - %s: %s".formatted(uuid, result.error(), message));
				}

				event.disallow(AsyncPlayerPreLoginEvent.Result.KICK_WHITELIST, message);
			}
		} catch (IOException | InterruptedException e) {
			logger.log(Level.WARNING, "Failed to check access permissions", e);

			event.disallow(AsyncPlayerPreLoginEvent.Result.KICK_OTHER,
					"There was an error checking your access permissions - please try again later or contact a moderator.");
		}
	}

	public void cleanCache() {
		this.userCache.clearExpired();
	}
}
