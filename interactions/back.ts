import { ButtonInteraction } from "discord.js";
import avatar from "./avatar";

export default async function (interaction: ButtonInteraction) {
    await avatar(interaction);
    await interaction.deleteReply();
}
