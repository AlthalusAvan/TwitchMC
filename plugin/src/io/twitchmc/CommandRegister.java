package io.twitchmc;


import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.configuration.file.FileConfiguration;
import org.json.JSONObject;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class CommandRegister implements CommandExecutor {



    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length < 1) {
            sender.sendMessage("Please select a valid subcommand!");
            return false;
        }

        FileConfiguration config = TwitchMC.instance.getConfig();

        if (args[0].equalsIgnoreCase("register")) {
            String existingCode = config.getString("server_id");
            if (existingCode.length() > 0) {
                sender.sendMessage("Server already registered - please remove the existing ID from your server if you're trying to set it up again.");
                return true;
            }

            if (args.length < 2) {
                sender.sendMessage("Please provide a valid registration code!");
                return false;
            }

            String code = args[1];

            if (code.length() < 1) {
                sender.sendMessage("Please provide a valid registration code!");
                return false;
            }

            sender.sendMessage("Attempting to register server with code " + code + " - please wait...");

            String serverRegistration = "";
            try {
                serverRegistration = registerServer(code);
            } catch (InterruptedException | IOException e) {
                e.printStackTrace();
                sender.sendMessage("There was an error registering the server - please try again later or contact a TwitchMC admin.");
                return true;
            }

            JSONObject result = new JSONObject(serverRegistration);

            if (result.has("error")) {
                Bukkit.getLogger().info("Error object found");
                JSONObject error = result.getJSONObject("error");

                String errorCode = error.getString("code");
                String errorDescription = error.getString("description");

                Bukkit.getLogger().info("Error registering server with TwitchMC, code: " + errorCode + " - description: " + errorDescription);

                sender.sendMessage("Error registering server with TwitchMC - " + errorDescription);
                return false;
            }

            if (result.has("id")) {
                config.set("server_id", result.getString("id"));
                TwitchMC.instance.saveConfig();

                sender.sendMessage("Server registered!");
            }
        } else {
            sender.sendMessage("Please select a valid subcommand");
            return false;
        }

        return true;
    }

    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .build();

    private String registerServer(String code) throws IOException, InterruptedException {
        FileConfiguration config = TwitchMC.instance.getConfig();

        String apiDomain = config.getString("api_domain");

        Map<Object, Object> data = new HashMap<>();
        data.put("code", code);

        Bukkit.getLogger().info(apiDomain + "/registerServer");

        HttpRequest request = HttpRequest.newBuilder()
                .POST(buildFormDataFromMap(data))
                .uri(URI.create(apiDomain + "/registerServer"))
                .setHeader("User-Agent", "Java 17 HttpClient Bot") // add request header
                .header("Content-Type", "application/x-www-form-urlencoded")
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        // print response body
        Bukkit.getLogger().info("Response code: "  + response.statusCode() + ", response body: " + response.body());

        return response.body();
    }

    private static HttpRequest.BodyPublisher buildFormDataFromMap(Map<Object, Object> data) {
        var builder = new StringBuilder();
        for (Map.Entry<Object, Object> entry : data.entrySet()) {
            if (builder.length() > 0) {
                builder.append("&");
            }
            builder.append(URLEncoder.encode(entry.getKey().toString(), StandardCharsets.UTF_8));
            builder.append("=");
            builder.append(URLEncoder.encode(entry.getValue().toString(), StandardCharsets.UTF_8));
        }
        return HttpRequest.BodyPublishers.ofString(builder.toString());
    }
}
