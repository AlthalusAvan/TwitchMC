package io.twitchmc.floodgate;

import java.util.UUID;

public interface PlayerMap {
	UUID getMappedUUID(UUID loginUUID);
}
