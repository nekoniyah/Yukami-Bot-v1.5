import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    StringSelectMenuBuilder,
} from "discord.js";
import { Avatar } from "../../utils/models";
import { renderComponentToPng } from "../../utils/render";
import {
    YukamiEmbed,
    createErrorEmbed,
    createLoadingEmbed,
    EMBED_EMOJIS,
    validateEmbed,
} from "../../utils/embeds";
import { Handler } from "../../events/interactionCreate";

// Cache for avatar data to reduce database queries
const avatarCache = new Map<string, { data: Avatar[]; expires: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

/**
 * Get user avatars with caching
 */
async function getUserAvatars(userId: string): Promise<Avatar[]> {
    const cached = avatarCache.get(userId);
    if (cached && cached.expires > Date.now()) {
        return cached.data;
    }

    const avatars = await Avatar.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
    });

    avatarCache.set(userId, {
        data: avatars,
        expires: Date.now() + CACHE_DURATION,
    });

    return avatars;
}

/**
 * Clear cache for user when avatars are modified
 */
export function clearAvatarCache(userId: string): void {
    avatarCache.delete(userId);
}

/**
 * Enhanced avatar management interface using new embed utility
 */
export default (async function avatarCommand(interaction, avatars, callback) {
    try {
        const startTime = Date.now();

        // Show loading message for better UX
        const loadingEmbed = createLoadingEmbed("Chargement des avatars");

        await callback({
            embeds: [loadingEmbed],
            files: [],
        });

        // Create main embed with new utility
        const mainEmbed = new YukamiEmbed()
            .setTitle(`${EMBED_EMOJIS.AVATAR} Avatars`)
            .setUserAuthor(
                interaction.user,
                `Avatars de ${interaction.user.displayName}`
            )
            .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
            .setBotFooter("Système de gestion des avatars");

        let imageBuffer: Buffer | null = null;

        if (avatars.length > 0) {
            mainEmbed.setDescription(
                `Tu as **${avatars.length}** avatar${
                    avatars.length !== 1 ? "s" : ""
                }\n` + `Selectionnes-en un pour editer, ou créez-en un nouveau.`
            );

            // Add top avatars field
            const topAvatars =
                avatars
                    .slice(0, 3)
                    .map(
                        (avatar) =>
                            `**${avatar.get("name")}** - Niveau ${avatar.get(
                                "level"
                            )}`
                    )
                    .join("\n") +
                (avatars.length > 3
                    ? `\n... et ${avatars.length - 3} de plus`
                    : "");

            mainEmbed.addFormattedField("🌟 Tes avatars", topAvatars);

            // Render character image with performance optimization
            try {
                const characterImage = await renderComponentToPng(
                    "Characters",
                    {
                        characters: avatars.map((avatar) => ({
                            name: avatar.get("name") as string,
                            avatarUrl: avatar.get("icon") as string,
                            species: avatar.get("species") as string,
                            level: avatar.get("level") as number,
                        })),
                        theme: "dark",
                    }
                );

                const arrayBuffer = await characterImage.arrayBuffer();
                imageBuffer = Buffer.from(arrayBuffer);
                mainEmbed.setImage("attachment://avatars.png");
            } catch (renderError) {
                console.warn("Failed to render character image:", renderError);
            }
        }

        // Validate embed before sending
        if (!validateEmbed(mainEmbed)) {
            throw new Error("Embed validation failed");
        }

        // Enhanced select menu for avatars
        const components: any[] = [];

        if (avatars.length > 0) {
            const avatarSelectMenu = new StringSelectMenuBuilder()
                .setCustomId("avatar")
                .setPlaceholder("🎭 Selectionnez un avatar à gérer...")
                .addOptions(
                    avatars.slice(0, 25).map((avatar) => ({
                        label: `${avatar.get("name")} (Niveau ${avatar.get(
                            "level"
                        )})`,
                        value: `${avatar.get("id")}`,
                        description: `${avatar.get(
                            "species"
                        )} • Clickez pour voir ou editer les détails`,
                    }))
                );

            components.push(
                new ActionRowBuilder().addComponents(avatarSelectMenu)
            );

            // Pagination for more than 25 avatars
            if (avatars.length > 25) {
                const prevButton = new ButtonBuilder()
                    .setCustomId("avatarPagePrev")
                    .setLabel("◀️ Précédent")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true);

                const nextButton = new ButtonBuilder()
                    .setCustomId("avatarPageNext")
                    .setLabel("Suivant ▶️")
                    .setStyle(ButtonStyle.Secondary);

                components.push(
                    new ActionRowBuilder().addComponents(prevButton, nextButton)
                );
            }
        }

        // Performance logging
        const responseTime = Date.now() - startTime;
        if (responseTime > 1000) {
            console.warn(
                `Slow avatar command response: ${responseTime}ms for ${interaction.user.tag}`
            );
        }

        // Send response
        const messageOptions = {
            embeds: [mainEmbed],
            components,
            files: imageBuffer
                ? [{ attachment: imageBuffer, name: "avatars.png" }]
                : [],
        };

        callback(messageOptions);
    } catch (error) {
        console.error("Error in avatar command:", error);

        const errorEmbed = createErrorEmbed(
            "Commande avatar échouée",
            "Impossible de charger les avatars. Réessayez plus tard.",
            process.env.NODE_ENV === "production"
                ? undefined
                : (error as Error).message
        );

        try {
            await callback({
                embeds: [errorEmbed],
                components: [],
                files: [],
            });
        } catch (replyError) {
            console.error("Failed to send error message:", replyError);
        }
    }
} as Handler<ChatInputCommandInteraction | ButtonInteraction>);
