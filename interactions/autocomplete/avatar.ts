// interactions/autocomplete/avatar.ts - Avatar name autocomplete
import { AutocompleteInteraction } from "discord.js";
import { Avatar } from "../../utils/models";

export default async function avatarAutocomplete(
    interaction: AutocompleteInteraction
): Promise<void> {
    try {
        // Verify this is actually an autocomplete interaction
        if (!interaction.isAutocomplete()) {
            console.error(
                "avatarAutocomplete called with non-autocomplete interaction"
            );
            return;
        }

        let focusedValue = "";
        try {
            focusedValue = interaction.options.getFocused();
        } catch (getFocusedError) {
            console.log("Could not get focused value:", getFocusedError);
            await interaction.respond([]);
            return;
        }

        // Get user's avatars
        const avatars = await Avatar.findAll({
            where: { userId: interaction.user.id },
            limit: 25, // Discord limit
        });

        // Filter avatars based on input
        const filtered = focusedValue
            ? avatars.filter((avatar) =>
                  avatar.name.toLowerCase().includes(focusedValue.toLowerCase())
              )
            : avatars.slice(0, 25); // Show first 25 if no filter

        const choices = filtered.map((avatar) => ({
            name: avatar.name,
            value: avatar.id.toString(),
        }));

        await interaction.respond(choices);
    } catch (error) {
        console.error("Error in avatar autocomplete:", error);
        try {
            // Only try to respond if the interaction hasn't been handled
            if (!interaction.responded) {
                await interaction.respond([]);
            }
        } catch (respondError) {
            console.error(
                "Failed to respond to autocomplete with empty array:",
                respondError
            );
            // If we can't respond, the interaction has likely expired or been handled elsewhere
        }
    }
}
