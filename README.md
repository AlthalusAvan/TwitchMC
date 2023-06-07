[![Plugin Build](https://github.com/AlthalusAvan/TwitchMC/actions/workflows/gradle-publish.yml/badge.svg)](https://github.com/AlthalusAvan/TwitchMC/actions/workflows/gradle-publish.yml)

# TwitchMC

**Public control panel instance available at [TwitchMC.io](https://twitchmc.io)**

A Spigot Plugin and Firebase-powered API allowing Twitch streamers to easily create subscriber-only Minecraft servers.

Need help? Find us on [Discord](https://discord.gg/YzsTNYXE).

### How do I install it on my server?

Head to the [Releases](https://github.com/AlthalusAvan/TwitchMC/releases) section to download the latest JAR file, and drop it into your Plugins directory. You will need to be running Spigot/Paper/some other fork.

### How does it work?

TwitchMC is made of 2 main components

##### Spigot Plugin

The Spigot plugin is very simple - when a user connects to the server, it sends a request to the API to check if the user should be given access to the server. All other logic is handled by the API, meaning we can keep the plugin simple and compatible for future versions.

##### API & Control Panel

This is what users will interface with. When they first connect to a TwitchMC-enabled server, they will be presented with a 6 Digit Hexadecimal code to verify their account. On the control panel, they'll log in with Twitch and then enter this code - this then links their Minecraft UUID to their Twitch identity in TwitchMC. From then on, we can use their identities to confirm if they should have server access.

The API and Control Panel are both built with NextJS, using the [T3 Stack](https://create.t3.gg/).

### Why change away from Firebase?

While Firebase was good for getting started quickly, we had a few issues arise in our time using it that led us to move away - primarily:

- Strange permissions issues that we couldn't diagnose. Some users would have the control panel endlessly load, and it would report that they did not have permission to access items in the databsae that they _definitely_ did.
- Issues with timeouts in Cloud Functions. Still not sure what was going on here, but some servers would regularly time out when checking a player's access permissions.

Overall, the T3 stack gives us more direct control over our Database, API and hosting, and simplifies our tech stack a bit. It also costs a bit less (since we had always-on firebase functions to help with latency), which is a nice bonus!

### Can I host my own version?

Yep, 100% - clone the repo and check out the [T3 Documentation](https://create.t3.gg/en/deployment) to get going. We used [Vercel](https://vercel.com/) to host the app, API and Postgres database on the public site.

### What's on the roadmap for future releases?

Check out the [Github Project](https://github.com/AlthalusAvan/TwitchMC/projects/1) for info on future development.

### How do I report an issue?

Please report bugs and issues here on Github in the [Issues](https://github.com/AlthalusAvan/TwitchMC/issues) section, or if you need more immediate support head to our [Discord server](https://discord.gg/YzsTNYXE).

### Can I help with this project?

Yes, absolutely - This project was made pretty quickly, so there will be a lot of room to improve.. We're happy to take pull requests from anyone that can contribute. See our [Github Project Board](https://github.com/AlthalusAvan/TwitchMC/projects/1) for ideas on improvements you can help with.
