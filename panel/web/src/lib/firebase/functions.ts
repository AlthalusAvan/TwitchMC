export function getApiBaseUrl() {
  if (process.env.NODE_ENV === "development")
    return "http://localhost:5001/twitch-mc/us-central1";
  else return `https://twitchmc.io/api`;
}
