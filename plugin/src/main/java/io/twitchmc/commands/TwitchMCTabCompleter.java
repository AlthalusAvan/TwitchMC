package io.twitchmc.commands;

import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;

import java.util.ArrayList;
import java.util.List;

public class TwitchMCTabCompleter implements TabCompleter {
	@Override
	public List<String> onTabComplete(CommandSender sender, Command cmd, String arg, String[] args) {
		List<String> options = new ArrayList<>();

		if (cmd.getName().equalsIgnoreCase("twitchmc")) {
			if (args.length == 1) {
				options.add("register");
			}
		}

		return options;
	}
}
