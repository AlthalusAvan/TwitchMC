package io.twitchmc.model;

import java.util.Optional;

public record ServerRegisterResponse(String id, Optional<Error> error) {
	public record Error(String code, String description) {

	}
}
