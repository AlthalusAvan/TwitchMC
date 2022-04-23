package io.twitchmc.commands;


import com.google.common.util.concurrent.FutureCallback;
import com.google.common.util.concurrent.Futures;
import io.twitchmc.ConfigHolder;
import io.twitchmc.http.ApiClient;
import io.twitchmc.model.ServerRegisterResponse;
import io.twitchmc.scheduler.Scheduler;
import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;

public class CommandRegister implements CommandExecutor {
	private final ApiClient apiClient;
	private final Scheduler scheduler;
	private final ConfigHolder configHolder;

	public CommandRegister(ApiClient apiClient, Scheduler scheduler, ConfigHolder configHolder) {
		this.apiClient = apiClient;
		this.scheduler = scheduler;
		this.configHolder = configHolder;
	}

	@Override
	public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
		if (args.length < 1) {
			sender.sendMessage("Please select a valid subcommand!");
			return false;
		}

		if (args[0].equalsIgnoreCase("register")) {
			if (args.length < 2) {
				sender.sendMessage("Please provide a valid registration code!");
				return false;
			}

			return register(sender, args[1]);
		} else {
			sender.sendMessage("Please select a valid subcommand");
			return false;
		}
	}

	private boolean register(CommandSender sender, String code) {
		var serverId = configHolder.getServerId();
		if (!serverId.isBlank()) {
			sender.sendMessage("Server already registered - please remove the existing ID from your server if you're trying to set it up again.");
			return true;
		}

		if (code.isEmpty()) {
			sender.sendMessage("Please provide a valid registration code!");
			return false;
		}

		sender.sendMessage("Attempting to register server with code " + code + " - please wait...");

		var fut = scheduler.runAsync(() -> apiClient.registerServer(code));
		Futures.addCallback(fut, new FutureCallback<>() {
			@Override
			public void onSuccess(ServerRegisterResponse result) {
				if (result.error() != null) {
					var error = result.error();

					Bukkit.getLogger().warning("Error registering server with TwitchMC, code: %s - description: %s"
							.formatted(error.code(), error.description()));

					sender.sendMessage("Error registering server with TwitchMC - %s".formatted(error.description()));
				} else {
					configHolder.setServerId(result.id());
					configHolder.saveToConfig();

					sender.sendMessage("Server registered!");
				}
			}

			@Override
			public void onFailure(Throwable e) {
				e.printStackTrace();
				sender.sendMessage("There was an error registering the server - please try again later or contact a TwitchMC admin.");
			}
		}, scheduler.getMainThreadExecutor());

		return true;
	}
}
