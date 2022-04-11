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
        Player player = event.getPlayer();

        if (player.isOp()) {
            return;
        }

        String uuid = player.getUniqueId().toString();

        Bukkit.getLogger().info(ChatColor.BLUE + uuid + " has joined");

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
                player.kickPlayer("Your Twitch subscription has expired! Please renew your subscription, or visit https://twitch-mc.web.app if you need to link a different account.");
            } else {
                String code = result.getString("code");

                player.kickPlayer("You need to link your Twitch account in order to play on this server! Please visit https://twitch-mc.web.app/connect and use code: " + code);
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

        // form parameters
        Map<Object, Object> data = new HashMap<>();
        data.put("uuid", uuid);

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
