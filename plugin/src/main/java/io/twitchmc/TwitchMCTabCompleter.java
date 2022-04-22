package io.twitchmc;

import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.configuration.file.FileConfiguration;

import java.util.ArrayList;
import java.util.List;

public class TwitchMCTabCompleter implements TabCompleter {
    @Override
    public List<String> onTabComplete(CommandSender sender, Command cmd, String arg, String[] args) {
        List<String> options = new ArrayList<>();

        if(cmd.getName().equalsIgnoreCase("twitchmc") && args.length >= 0) {
            if (args.length == 1) {
                FileConfiguration config = TwitchMC.instance.getConfig();

                if (config.getString("server_id").length() <= 0) {
                    options.add("register");
                }

            }
        }

        return options;
    }
}
