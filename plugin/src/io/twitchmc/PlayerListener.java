package io.twitchmc;

import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
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

public class PlayerListener implements Listener {
     @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) throws IOException {
        FileConfiguration config = TwitchMC.instance.getConfig();

        Player player = event.getPlayer();

        if (player.isOp()) {
            return;
        }

        String uuid = player.getUniqueId().toString();

        Bukkit.getLogger().info(ChatColor.BLUE + uuid + " has joined, checking access");

        boolean isServerVerified = config.getString("server_id").length() > 0;

        if (!isServerVerified) {
            player.kickPlayer("This server has not been verified with TwitchMC yet. Please contact a server admin - or if you are a server admin, head to https://twitchmc.io/servers");
        }


        String accessCheck = "";
        try {
            accessCheck = checkAccess(uuid);
        } catch (InterruptedException e) {
            e.printStackTrace();
            player.kickPlayer("There was an error checking your access permissions - please try again later or contact a moderator.");
        }

        JSONObject result = new JSONObject(accessCheck);
        boolean access = result.getBoolean("access");

        if (!access) {
            boolean linked = result.getBoolean("linked");
            if (linked) {
                player.kickPlayer("You don't have an active subscription to the streamer that owns this server! Please renew your subscription, or visit https://twitchmc.io if you need to link a different account.");
            } else {
                String code = result.getString("code");

                player.kickPlayer("You need to link your Twitch account in order to play on this server! Please visit https://twitchmc.io/connect and use code: " + code);
            }
        }

    }
    // one instance, reuse
    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .build();


    private String checkAccess(String uuid) throws IOException, InterruptedException {
        FileConfiguration config = TwitchMC.instance.getConfig();

        String apiDomain = config.getString("api_domain");
        String serverId = config.getString("server_id");

        // form parameters
        Map<Object, Object> data = new HashMap<>();
        data.put("uuid", uuid);
        data.put("serverId", serverId);

        HttpRequest request = HttpRequest.newBuilder()
                .POST(buildFormDataFromMap(data))
                .uri(URI.create(apiDomain + "/checkAccess"))
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
