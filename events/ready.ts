import { REST, Routes } from "discord.js";
import eventBuilder from "../eventBuilder";
import "dotenv/config";
import fs from "fs";
import path from "path";
export default eventBuilder<"ready">(async (client) => {
    console.log(`Logged in as ${client.user.username}`);

    // Registering slash commands

    const rest = new REST().setToken(process.env.TOKEN!);

    let commands: any[] = [];
    const registerFolder = path.join(__dirname, "..", "registers");
    const registerFiles = fs
        .readdirSync(registerFolder)
        .filter((file) => file.endsWith(".ts"));

    for (let f of registerFiles) {
        let { default: reg } = await import(path.join(registerFolder, f));
        commands.push(reg.toJSON());
    }

    const cmds = (await rest.put(Routes.applicationCommands(client.user.id), {
        body: commands,
    })) as any[];

    for (let cmd of commands) {
        if (cmds.find((c) => c.name === cmd.name)) {
            console.log(
                `Successfully registered application command: ${cmd.name}`
            );
        } else {
            console.log(`Failed to register application command: ${cmd.name}`);
        }
    }
});
