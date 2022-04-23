package io.twitchmc.model;

public record CheckAccessResponse(boolean access, boolean linked, String code) {}
