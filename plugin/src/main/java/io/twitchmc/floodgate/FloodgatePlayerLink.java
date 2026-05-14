package io.twitchmc.floodgate;

import org.geysermc.floodgate.api.FloodgateApi;
import org.geysermc.floodgate.api.link.PlayerLink;

import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.logging.Level;
import java.util.logging.Logger;

public class FloodgatePlayerLink implements PlayerMap {
	private final Logger logger;
	private final FloodgateApi floodgateApi;
	private final PlayerLink playerLink;

	public FloodgatePlayerLink(Logger logger) {
		this.logger = logger;
		this.floodgateApi = FloodgateApi.getInstance();
		this.playerLink = floodgateApi.getPlayerLink();
	}

	@Override
	public UUID getMappedUUID(UUID loginUUID) {
		// If we're a normal java UUID, continue unchanged
		// If linking is disabled, continue unchanged
		if (!floodgateApi.isFloodgateId(loginUUID) || !playerLink.isEnabled()) {
			return loginUUID;
		}

		// Else if it's a floodgate UUID, try resolving the link
		var fut = playerLink.getLinkedPlayer(loginUUID).thenApply(linkedPlayer -> {
			if (linkedPlayer != null) {
				logger.info("Found linked player for XUID %s".formatted(linkedPlayer.getBedrockId()));
				return linkedPlayer.getJavaUniqueId();
			} else {
				// No link, just return the floodgate UUID back to be checked against the whitelist
				logger.fine("No linked player for player %s, checking against Bedrock account".formatted(loginUUID));
				return loginUUID;
			}
		});

		try {
			return fut.get(10, TimeUnit.SECONDS);
		} catch (InterruptedException | ExecutionException | TimeoutException e) {
			logger.log(Level.WARNING, "Failed to resolve linked player", e);
			throw new RuntimeException("Failed to resolve linked player", e);
		}
	}
}
