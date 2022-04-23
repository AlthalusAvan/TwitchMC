package io.twitchmc.model;

public record ServerRegisterResponse(String id, Error error) {
	public record Error(String code, String description) {

	}
}
