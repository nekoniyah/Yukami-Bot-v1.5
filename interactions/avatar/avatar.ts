import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    StringSelectMenuBuilder,
} from "discord.js";
import { Avatar } from "../../utils/models";
import locale from "../../locales/locale";
import { renderComponentToPng } from "../../utils/render";
import {
    YukamiEmbed,
    createErrorEmbed,
    createLoadingEmbed,
    EMBED_EMOJIS,
    validateEmbed,
} from "../../utils/embeds";

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
export default async function avatarCommand(
    interaction: ChatInputCommandInteraction | ButtonInteraction
) {
    const isBack = interaction.isButton();
    const avatars = await getUserAvatars(interaction.user.id);

    try {
        const startTime = Date.now();
        const loc = await locale(interaction.locale ?? "en");

        // Show loading message for better UX
        const loadingEmbed = createLoadingEmbed("Chargement des avatars");

        if (!isBack) {
            await interaction.editReply({ embeds: [loadingEmbed], files: [] });
        } else {
            await interaction.message.edit({
                embeds: [loadingEmbed],
                files: [],
            });
        }

        // Create main embed with new utility
        const mainEmbed = new YukamiEmbed()
            .setTitle(`${EMBED_EMOJIS.AVATAR} ${loc.ui.avatars.title}`)
            .setUserAuthor(
                interaction.user,
                `${interaction.user.displayName}'s Avatars`
            )
            .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
            .setBotFooter("Avatar Management System");

        let imageBuffer: Buffer | null = null;

        if (avatars.length > 0) {
            // Enhanced description with stats
            const totalLevels = avatars.reduce(
                (sum, avatar) => sum + (avatar.get("level") as number),
                0
            );
            const highestLevel = Math.max(
                ...avatars.map((avatar) => avatar.get("level") as number)
            );

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
                            `${getSpeciesEmoji(
                                avatar.get("species") as string
                            )} **${avatar.get("name")}** - Niveau ${avatar.get(
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

        // Enhanced button components
        const createButton = new ButtonBuilder()
            .setCustomId("createAvatar")
            .setLabel(`✨ Créer un avatar`)
            .setStyle(ButtonStyle.Success)
            .setEmoji("🎭");

        const refreshButton = new ButtonBuilder()
            .setCustomId("refreshAvatars")
            .setLabel("🔄 Rafraîchir")
            .setStyle(ButtonStyle.Secondary);

        // Enhanced select menu for avatars
        const components: any[] = [];

        if (avatars.length > 0) {
            const avatarSelectMenu = new StringSelectMenuBuilder()
                .setCustomId("avatarSelect")
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
                        emoji: getSpeciesEmoji(avatar.get("species") as string),
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

        // Main action buttons
        components.push(
            new ActionRowBuilder().addComponents(createButton, refreshButton)
        );

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

        if (isBack) await interaction.message.edit(messageOptions);
        else await interaction.editReply(messageOptions);
    } catch (error) {
        console.error("Error in avatar command:", error);

        const errorEmbed = createErrorEmbed(
            "Avatar Command Failed",
            "Failed to load your avatars. Please try again.",
            process.env.NODE_ENV === "production"
                ? undefined
                : (error as Error).message
        );

        try {
            if (isBack)
                await interaction.message.edit({
                    embeds: [errorEmbed],
                    components: [],
                    files: [],
                });
            else
                await interaction.editReply({
                    embeds: [errorEmbed],
                    components: [],
                    files: [],
                });
        } catch (replyError) {
            console.error("Failed to send error message:", replyError);
        }
    }
}

/**
 * Get emoji for species
 */
function getSpeciesEmoji(species: string): string {
    const emojiMap: Record<string, string> = {
        human: "👤",
        elf: "🧝",
        dwarf: "⚒️",
        cat: "🐱",
        dog: "🐕",
        wolf: "🐺",
        dragon: "🐉",
        bird: "🦅",
        fish: "🐟",
        robot: "🤖",
        alien: "👽",
    };
    return emojiMap[species] || "✨";
}
