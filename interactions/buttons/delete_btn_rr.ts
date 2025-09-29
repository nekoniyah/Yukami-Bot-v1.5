import { ButtonInteraction } from "discord.js";

export default async function (interaction: ButtonInteraction) {
    await interaction.deleteReply();
}
