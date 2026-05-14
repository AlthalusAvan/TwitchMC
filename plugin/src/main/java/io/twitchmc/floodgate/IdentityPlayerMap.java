package io.twitchmc.floodgate;

import java.util.UUID;

public class IdentityPlayerMap implements PlayerMap {
	@Override
	public UUID getMappedUUID(UUID loginUUID) {
		return loginUUID;
	}
}
