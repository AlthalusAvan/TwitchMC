package io.twitchmc.http;

import java.net.URLEncoder;
import java.net.http.HttpRequest;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public class FormData {
	public final List<String> elements = new ArrayList<>();

	public FormData add(String key, String value) {
		elements.add(URLEncoder.encode(key, StandardCharsets.UTF_8) +
				"=" + URLEncoder.encode(value, StandardCharsets.UTF_8));

		return this;
	}

	public HttpRequest.BodyPublisher toBody() {
		return HttpRequest.BodyPublishers.ofString(this.toString(), StandardCharsets.UTF_8);
	}

	@Override
	public String toString() {
		return String.join("&", elements);
	}
}
