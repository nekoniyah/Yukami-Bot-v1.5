// interactions/autocomplete/avatar.ts - Avatar name autocomplete
import { AutocompleteInteraction } from "discord.js";
import { Avatar } from "../../utils/models";

export default async function avatarAutocomplete(
    interaction: AutocompleteInteraction
): Promise<void> {
    try {
        const focusedValue = interaction.options.getFocused();

        // Get user's avatars
        const avatars = await Avatar.findAll({
            where: { userId: interaction.user.id },
            limit: 25, // Discord limit
        });

        // Filter avatars based on input
        const filtered = avatars.filter((avatar) =>
            avatar.name.toLowerCase().includes(focusedValue.toLowerCase())
        );

        const choices = filtered.map((avatar) => ({
            name: avatar.name,
            value: avatar.id.toString(),
        }));

        await interaction.respond(choices);
    } catch (error) {
        console.error("Error in avatar autocomplete:", error);
        await interaction.respond([]);
    }
}
