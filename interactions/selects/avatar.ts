import {
    AnySelectMenuInteraction,
    StringSelectMenuInteraction,
} from "discord.js";
import { Avatar } from "../../utils/models";
import { renderComponentToPng } from "../../utils/render";
import stats from "../../db/stats.json";
import { createAvatarEmbed, createErrorEmbed } from "../../utils/embeds";
import { getButtonSet } from "../../utils/components";
import { Handler } from "../../events/interactionCreate";

export default (async function avatarSelect(
    interaction: StringSelectMenuInteraction,
    avatars,
    callback
) {
    try {
        const avatarId = interaction.values[0];

        // Fetch avatar with error handling
        const avatar = await Avatar.findByPk(avatarId);

        if (!avatar) {
            const errorEmbed = createErrorEmbed("Avatar introuvable");

            await callback({
                embeds: [errorEmbed],
                components: [],
            });
            return;
        }

        // Verify ownership
        if (avatar.get("userId") !== interaction.user.id) {
            const errorEmbed = createErrorEmbed("Vous n'avez pas cette avatar");

            await callback({
                embeds: [errorEmbed],
                components: [],
            });
            return;
        }

        // Get avatar data
        const name = avatar.get("name") as string;
        const species = avatar.get("species") as string;
        const level = avatar.get("level") as number;
        const iconUrl = avatar.get("icon") as string;
        const bracket = avatar.get("bracket") as string;
        const createdAt = avatar.get("createdAt") as Date;

        // Calculate stats
        const avatarStats = stats[species as keyof typeof stats];
        const calculatedStats: Record<string, number> = {};

        if (avatarStats) {
            Object.entries(avatarStats).forEach(([statName, statData]) => {
                if (typeof statData.base === "string") {
                    // Handle dynamic calculations

                    let res = new Function(`
                    const level = ${level};
                    const stats = ${JSON.stringify(
                        statData
                    )}; // Mock for calculation
                    return ${statData.base};
                `)();

                    calculatedStats[statName] = res; // Fallback
                } else {
                    calculatedStats[statName] = Math.floor(
                        statData.base +
                            (statData.perLevel as number) * (level - 1)
                    );
                }
            });
        }

        // Create detailed embed
        const avatarEmbed = createAvatarEmbed(avatar, interaction.user);

        // Render individual character card
        let imageBuffer: Buffer | null = null;
        try {
            const characterImage = await renderComponentToPng("CharacterCard", {
                name,
                avatarUrl: iconUrl,
                species,
                level,
                experience: 0, // You might want to add experience tracking
                experienceToNext: 100,
                theme: "dark",
                showProgress: true,
            });

            const arrayBuffer = await characterImage.arrayBuffer();
            imageBuffer = Buffer.from(arrayBuffer);
            avatarEmbed.setImage("attachment://character.png");
        } catch (renderError) {
            console.warn("Failed to render character card:", renderError);
        }

        await callback({
            embeds: [avatarEmbed],
            components: await getButtonSet(
                avatarId,
                "name",
                "bracket",
                "avatar",
                "delete",
                "levelup",
                "back"
            ),
            files: imageBuffer
                ? [{ attachment: imageBuffer, name: "character.png" }]
                : [],
        });
    } catch (error) {
        console.error("Error in avatar select:", error);

        const errorEmbed = createErrorEmbed("Une erreur est survenue");

        await callback({
            embeds: [errorEmbed],
            components: [],
        });
    }
} as Handler<AnySelectMenuInteraction>);
