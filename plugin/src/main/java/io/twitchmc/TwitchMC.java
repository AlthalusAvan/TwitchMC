package io.twitchmc;

import io.twitchmc.commands.CommandRegister;
import io.twitchmc.commands.TwitchMCTabCompleter;
import io.twitchmc.http.ApiClient;
import io.twitchmc.scheduler.Scheduler;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.plugin.java.JavaPlugin;

public class TwitchMC extends JavaPlugin {
	@Override
	public void onEnable() {
		Bukkit.getLogger().info(ChatColor.GREEN + "Enabled " + this.getName());
		saveDefaultConfig();

		var configHolder = new ConfigHolder(this);
		var config = getConfig();

		var apiDomain = config.getString("api_domain");
		var apiClient = new ApiClient(apiDomain, this.getDescription().getVersion());
		var scheduler = new Scheduler(this);

		var playerListener = new PlayerListener(apiClient, configHolder);
		getServer().getPluginManager().registerEvents(playerListener, this);

		this.getCommand("twitchmc").setTabCompleter(new TwitchMCTabCompleter());
		this.getCommand("twitchmc").setExecutor(new CommandRegister(apiClient, scheduler, configHolder));

		this.getServer().getScheduler().runTaskTimerAsynchronously(this, playerListener::cleanCache, 0L, 6000L);
	}

	@Override
	public void onDisable() {
		Bukkit.getLogger().info(ChatColor.RED + "Disabled " + this.getName());
	}
}
