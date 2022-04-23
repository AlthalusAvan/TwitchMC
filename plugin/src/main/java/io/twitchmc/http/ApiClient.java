package io.twitchmc.http;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import io.twitchmc.model.CheckAccessResponse;
import io.twitchmc.model.ServerRegisterResponse;
import io.twitchmc.util.RecordTypeAdapterFactory;

import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
	private static final String USER_AGENT = "TwitchMC/0.1.0";

	private final Gson gson = new GsonBuilder()
			.registerTypeAdapterFactory(new RecordTypeAdapterFactory())
			.create();

	private final HttpClient httpClient = HttpClient.newBuilder()
			.version(HttpClient.Version.HTTP_2)
			.build();

	private final String apiDomain;

	public ApiClient(String apiDomain) {
		this.apiDomain = apiDomain;
	}

	public ServerRegisterResponse registerServer(String code) throws IOException, InterruptedException {
		var data = new FormData()
				.add("code", code);

		HttpRequest request = HttpRequest.newBuilder()
				.POST(data.toBody())
				.uri(URI.create(apiDomain + "/registerServer"))
				.setHeader("User-Agent", USER_AGENT)
				.header("Content-Type", "application/x-www-form-urlencoded")
				.build();

		var response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
		var reader = new InputStreamReader(response.body());

		return gson.fromJson(reader, ServerRegisterResponse.class);
	}

	public CheckAccessResponse checkAccess(String uuid, String serverId) throws IOException, InterruptedException {
		var data = new FormData()
				.add("uuid", uuid)
				.add("serverId", serverId);

		HttpRequest request = HttpRequest.newBuilder()
				.POST(data.toBody())
				.uri(URI.create(apiDomain + "/checkAccess"))
				.setHeader("User-Agent", USER_AGENT)
				.header("Content-Type", "application/x-www-form-urlencoded")
				.build();

		var response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
		var reader = new InputStreamReader(response.body());

		return gson.fromJson(reader, CheckAccessResponse.class);
	}
}
