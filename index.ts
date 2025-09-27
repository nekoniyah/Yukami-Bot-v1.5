import { Client, Partials } from "discord.js";
import fs from "fs";
import path from "path";
import "./db";
import "dotenv/config";

const eventPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventPath, { withFileTypes: true });

const client = new Client({
    intents: [
        "Guilds",
        "GuildMessages",
        "MessageContent",
        "GuildMembers",
        "GuildPresences",
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.GuildMember,
        Partials.User,
        Partials.ThreadMember,
    ],
});

for (const file of eventFiles) {
    if (file.isDirectory()) {
        const subEventFiles = fs.readdirSync(path.join(eventPath, file.name), {
            withFileTypes: true,
        });

        const eventName = file.name;
        for (const subFile of subEventFiles) {
            if (subFile.isFile() && subFile.name.endsWith(".ts")) {
                const { default: event } = await import(
                    path.join(eventPath, file.name, subFile.name)
                );

                client.on(
                    eventName.replace(".ts", ""),
                    async (...args) => await event(...args)
                );
            }
        }
    } else if (file.isFile() && file.name.endsWith(".ts")) {
        const { default: event } = await import(
            path.join(eventPath, file.name)
        );
        client.on(
            file.name.replace(".ts", ""),
            async (...args) => await event(...args)
        );
    }
}

client.login(process.env.TOKEN);
