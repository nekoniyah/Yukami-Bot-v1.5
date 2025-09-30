import { ButtonInteraction } from "discord.js";
import avatarCommand from "../avatar/avatar";
import { clearAvatarCache } from "../avatar/avatar";

export default async function backToAvatars(interaction: ButtonInteraction) {
    if (!interaction.deferred && !interaction.replied)
        await interaction.deferReply();
    interaction.deleteReply();
    try {
        // Clear cache to ensure fresh data
        clearAvatarCache(interaction.user.id);

        // Use the main avatar command
        await avatarCommand(interaction);
    } catch (error) {
        console.error("Error in back navigation:", error);
    }
}
