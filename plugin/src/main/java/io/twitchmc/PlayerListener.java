package io.twitchmc;

import io.twitchmc.http.ApiClient;
import io.twitchmc.util.UserCache;
import net.milkbowl.vault.permission.Permission;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.OfflinePlayer;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.AsyncPlayerPreLoginEvent;

import java.io.IOException;

public class PlayerListener implements Listener {
	private final ApiClient apiClient;
	private final ConfigHolder configHolder;
	private final UserCache userCache;
	private Permission permissionApi;

	public PlayerListener(ApiClient apiClient, ConfigHolder configHolder) {
		this.apiClient = apiClient;
		this.configHolder = configHolder;
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
		var uuid = event.getUniqueId();
		var offlinePlayer = Bukkit.getOfflinePlayer(uuid);

		if (canPlayerBypass(offlinePlayer)) {
			event.allow();
			return;
		}

		Bukkit.getLogger().info("%s%s has joined, checking access".formatted(ChatColor.BLUE, uuid));

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
				var message = result.linked()
						? "You don't have an active subscription to the streamer that owns this server! Please renew " +
						"your subscription, or visit https://twitchmc.io if you need to link a different account."
						: "You need to link your Twitch account in order to play on this server! Please " +
						"visit https://twitchmc.io/connect and use code: %s".formatted(result.code());

				event.disallow(AsyncPlayerPreLoginEvent.Result.KICK_WHITELIST, message);
			}
		} catch (IOException | InterruptedException e) {
			e.printStackTrace();

			event.disallow(AsyncPlayerPreLoginEvent.Result.KICK_OTHER,
					"There was an error checking your access permissions - please try again later or contact a moderator.");
		}
	}

	public void cleanCache() {
		this.userCache.clearExpired();
	}
}
