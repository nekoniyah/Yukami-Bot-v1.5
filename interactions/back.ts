import { ButtonInteraction } from "discord.js";
import avatarCommand from "./avatar";
import { clearAvatarCache } from "./avatar";

export default async function backToAvatars(interaction: ButtonInteraction) {
    try {
        // Clear cache to ensure fresh data
        clearAvatarCache(interaction.user.id);

        // Use the main avatar command
        await avatarCommand(interaction);
    } catch (error) {
        console.error("Error in back navigation:", error);
        await interaction.reply({
            content:
                "❌ Failed to go back. Please try using the avatar command again.",
            ephemeral: true,
        });
    }
}
