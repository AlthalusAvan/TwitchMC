package io.twitchmc.scheduler;

import com.google.common.util.concurrent.Futures;
import com.google.common.util.concurrent.ListenableFuture;
import io.twitchmc.TwitchMC;

import java.util.concurrent.Callable;
import java.util.concurrent.Executor;

public class Scheduler {
	private final TwitchMC plugin;

	public Scheduler(TwitchMC plugin) {
		this.plugin = plugin;
	}

	public Executor getMainThreadExecutor() {
		return runnable -> plugin.getServer().getScheduler().runTask(plugin, runnable);
	}

	public Executor getAsyncExecutor() {
		return runnable -> plugin.getServer().getScheduler().runTaskAsynchronously(plugin, runnable);
	}

	public <T> ListenableFuture<T> runAsync(Callable<T> function) {
		return Futures.submit(function, this.getAsyncExecutor());
	}
}
