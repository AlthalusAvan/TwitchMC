package io.twitchmc;

import com.google.common.base.Strings;

public class ConfigHolder {
	private final TwitchMC plugin;
	private String serverId;

	public ConfigHolder(TwitchMC plugin) {
		this.plugin = plugin;
		this.serverId = Strings.nullToEmpty(plugin.getConfig().getString("server_id"));
	}

	public String getServerId() {
		return serverId;
	}

	public void setServerId(String serverId) {
		this.serverId = serverId;
	}

	public void saveToConfig() {
		plugin.getConfig().set("server_id", serverId);

		plugin.saveConfig();
	}
}
