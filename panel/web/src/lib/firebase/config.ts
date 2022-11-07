import { app } from "./app";
import { getRemoteConfig } from "firebase/remote-config";

export const remoteConfig = getRemoteConfig(app);

remoteConfig.defaultConfig = {
  testServerAddress: "146.59.220.221:25639",
};

remoteConfig.settings.minimumFetchIntervalMillis = 3600000;
