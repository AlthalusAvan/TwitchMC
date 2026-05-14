package io.twitchmc.model;

public record CheckAccessResponse(boolean access, boolean linked, String code, String error, String description) {
	public boolean hasError() {
		return this.error != null;
	}
}
