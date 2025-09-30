// interactions/buttons/refresh.ts - Refresh button handler
import { ButtonInteraction } from "discord.js";
import { createSuccessEmbed } from "../../utils/embeds";
import { clearAvatarCache } from "../../events/interactionCreate";
import avatarCommand from "../avatar/avatar";

export default async function refreshHandler(
    interaction: ButtonInteraction
): Promise<void> {
    await interaction.deleteReply();
    try {
        // Clear user's avatar cache
        clearAvatarCache(interaction.user.id);

        await avatarCommand(interaction);
    } catch (error) {
        console.error("Error in refresh handler:", error);
        throw error;
    }
}
