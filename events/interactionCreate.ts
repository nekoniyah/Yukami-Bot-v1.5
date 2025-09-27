import path from "path";
import eventBuilder from "../eventBuilder";
import fs from "fs";

export default eventBuilder<"interactionCreate">(async (interaction) => {
    let now = Date.now();

    if (interaction.isCommand()) {
        const { commandName } = interaction;
        let interactionFolder = path.join(__dirname, "..", "interactions");
        let interactionFiles = fs
            .readdirSync(interactionFolder)
            .filter((file) => file.endsWith(".ts"));

        let cmdFilename = interactionFiles.find(
            (f) => f === `${commandName}.ts`
        );

        if (cmdFilename) {
            let { default: cmd } = await import(
                path.join(interactionFolder, cmdFilename)
            );
            await cmd(interaction, { now });
        }
    }
});
