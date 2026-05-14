package io.twitchmc;

import io.twitchmc.commands.CommandRegister;
import io.twitchmc.commands.TwitchMCTabCompleter;
import io.twitchmc.floodgate.FloodgatePlayerLink;
import io.twitchmc.floodgate.IdentityPlayerMap;
import io.twitchmc.floodgate.PlayerMap;
import io.twitchmc.http.ApiClient;
import io.twitchmc.scheduler.Scheduler;
import org.bukkit.Bukkit;
import org.bukkit.plugin.java.JavaPlugin;

public class TwitchMC extends JavaPlugin {
	@Override
	public void onEnable() {
		getLogger().info("Enabled " + this.getName());
		saveDefaultConfig();

		var configHolder = new ConfigHolder(this);
		var config = getConfig();

		var apiDomain = config.getString("api_domain");
		var apiClient = new ApiClient(apiDomain, this.getDescription().getVersion());
		var scheduler = new Scheduler(this);

		PlayerMap playerMap = new IdentityPlayerMap();
		if (Bukkit.getPluginManager().isPluginEnabled("floodgate")) {
			playerMap = new FloodgatePlayerLink(getLogger());
		}

		var playerListener = new PlayerListener(apiClient, configHolder, getLogger(), playerMap);
		getServer().getPluginManager().registerEvents(playerListener, this);

		this.getCommand("twitchmc").setTabCompleter(new TwitchMCTabCompleter());
		this.getCommand("twitchmc").setExecutor(new CommandRegister(apiClient, scheduler, configHolder, getLogger()));

		this.getServer().getScheduler().runTaskTimerAsynchronously(this, playerListener::cleanCache, 0L, 6000L);
	}

	@Override
	public void onDisable() {
		getLogger().info("Disabled " + this.getName());
	}
}
