# TwitchMC

A Spigot Plugin and Firebase-powered API allowing Twitch streamers to easily create subscriber-only Minecraft servers.

Need help? Find us on [Discord](https://discord.gg/YzsTNYXE).

### How do I install it on my server?

The project is not yet available for public use - it's currently in testing on a few beta servers, once I'm confident in its performance and reliability I'll start publishing releases here. If you want to test it in the meantime, you're more than welcome to build the plugin from source yourself.

### How does it work?

TwitchMC is made of 3 main components

#### Spigot Plugin

The Spigot plugin is very simple - when a user connects to the server, it sends a request to the API to check if the user should be given access to the server. All other logic is handled by the API, meaning we can keep the plugin simple and compatible for future versions.

#### API

The API uses TypeScript and NodeJS, and is entirely based on Firebase Functions. It handles 3 main functions - OAuth with Twitch, checking if a user should have access (i.e. if they're subscribed to the server owner's Twitch channel), and handling server registrations.

#### Web Control Panel

This is what users will interface with. When they first connect to a TwitchMC-enabled server, they will be presented with a 6 Digit Hexadecimal code to verify their account. On the control panel, they'll log in with Twitch and then enter this code - this then links their Minecraft UUID to their Twitch identity in TwitchMC. From then on, we can use their identities to confirm if they should have server access.

### Why use Firebase?

It's easy to get started with and provides a lot of useful functionality out of the gate. Not having to worry about creating a databse system, managing hosting etc. was very important to getting this project done - this is an entirely free-time project.

### Can I host my own version?

Yep, 100% - clone the repo and check out the [Firebase Documentation](https://firebase.google.com/?gclid=Cj0KCQjwmPSSBhCNARIsAH3cYgbvKuIcb0Ddyhmu_3QRcYzxMfdzfkQk_Xi4e2L9SnNme_Kc35EvRL4aArHiEALw_wcB&gclsrc=aw.ds) to get going. Once your Firebase instances are online, change the API Domain in your plugin's config file and you're good to go!

### What's on the roadmap for future releases?

Check out the [Github Project](https://github.com/AlthalusAvan/TwitchMC/projects/1) for info on future development.

### How do I report an issue?

Please report bugs and issues here on Github in the [Issues](https://github.com/AlthalusAvan/TwitchMC/issues) section, or if you need more immediate support head to our [Discord server](https://discord.gg/YzsTNYXE).

### Can I help with this project?

Yes, absolutely - This project was made pretty quickly, so there will be a lot of room to improve.. We're happy to take pull requests from anyone that can contribute. See our [Github Project Board](https://github.com/AlthalusAvan/TwitchMC/projects/1) for ideas on improvements you can help with.
