// interactions/buttons/refresh.ts - Refresh button handler
import { ButtonInteraction } from "discord.js";
import { createSuccessEmbed } from "../../utils/embeds";
import { clearAvatarCache } from "../../events/interactionCreate";

export default async function refreshHandler(
    interaction: ButtonInteraction
): Promise<void> {
    try {
        // Clear user's avatar cache
        clearAvatarCache(interaction.user.id);

        const embed = createSuccessEmbed(
            "Content Refreshed",
            "Your content has been refreshed with the latest data."
        );

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error("Error in refresh handler:", error);
        throw error;
    }
}
