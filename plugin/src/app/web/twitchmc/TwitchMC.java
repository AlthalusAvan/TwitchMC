package app.web.twitchmc;

import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.plugin.java.JavaPlugin;

public class TwitchMC extends JavaPlugin {
    public static TwitchMC instance;

    @Override
    public void onEnable() {
        Bukkit.getLogger().info(ChatColor.GREEN + "Enabled " + this.getName());
        saveDefaultConfig();
        getServer().getPluginManager().registerEvents(new PlayerListener(), this);
        instance = this;
    }

    @Override
    public void onDisable() {
        Bukkit.getLogger().info(ChatColor.RED + "Disabled " + this.getName());
    }

}
