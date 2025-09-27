import eventBuilder from "../eventBuilder";
import path from "path";
import fs from "fs";
import { Avatar } from "../models";
import { EmbedBuilder } from "discord.js";

export default eventBuilder<"interactionCreate">(async (interaction) => {
    // Handle the interaction

    let now = Date.now();
    let avatars = await Avatar.findAll({
        where: {
            userId: interaction.user.id,
        },
    });
    const interactionFolder = fs.readdirSync(
        path.join(__dirname, "..", "interactions")
    );

    try {
        if (interaction.isCommand()) {
            const { commandName } = interaction;

            const interactionFile = interactionFolder.find(
                (file) => file === `${commandName}.ts`
            );

            if (interactionFile) {
                const { default: f } = await import(
                    `../interactions/${interactionFile}`
                );

                await interaction.deferReply({
                    withResponse: false,
                });

                await f(interaction, now, avatars);
            }
        } else if (interaction.isButton() || interaction.isAnySelectMenu()) {
            const { default: f } = await import(
                `../interactions/${interaction.customId}.ts`
            );

            await interaction.deferReply({
                withResponse: false,
            });

            await f(interaction, avatars);
        }
    } catch (e) {
        let embed = new EmbedBuilder()
            .setTitle("Error")
            .setDescription(
                "An error occured. It might be a bug in the code, please retry later"
            )
            .setColor("Red")
            .setTimestamp();

        if (interaction.isChatInputCommand())
            interaction.reply({ embeds: [embed] });
        console.error(e);
    }
});
