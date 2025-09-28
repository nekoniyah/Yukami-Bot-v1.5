import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    StringSelectMenuBuilder,
    ComponentType,
} from "discord.js";
import { Avatar } from "../utils/models";
import locale from "../locales/locale";
import { renderComponentToPng } from "../utils/render";

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
 * Enhanced avatar management interface
 */
export default async function avatarCommand(
    interaction: ChatInputCommandInteraction | ButtonInteraction
) {
    try {
        const startTime = Date.now();
        const loc = await locale(interaction.locale ?? "en");
        const avatars = await getUserAvatars(interaction.user.id);

        // Create main embed with enhanced styling
        const mainEmbed = new EmbedBuilder()
            .setTitle(`🎭 ${loc.ui.avatars.title}`)
            .setColor("#5865F2")
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL({ size: 128 }),
            })
            .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
            .setTimestamp()
            .setFooter({
                text: `${process.env.NAME ?? "Yukami Bot"} • Avatar System`,
                iconURL: interaction.client.user?.displayAvatarURL(),
            });

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

            mainEmbed
                .setDescription(
                    `You have **${avatars.length}** avatar${
                        avatars.length !== 1 ? "s" : ""
                    }\n` +
                        `📊 Total Levels: **${totalLevels}** | Highest Level: **${highestLevel}**\n\n` +
                        `Select an avatar to edit, or create a new one below.`
                )
                .addFields([
                    {
                        name: "📈 Quick Stats",
                        value:
                            avatars
                                .slice(0, 3)
                                .map(
                                    (avatar) =>
                                        `• **${avatar.get(
                                            "name"
                                        )}** - Level ${avatar.get("level")}`
                                )
                                .join("\n") +
                            (avatars.length > 3
                                ? `\n... and ${avatars.length - 3} more`
                                : ""),
                        inline: true,
                    },
                    {
                        name: "🎮 Actions Available",
                        value: "• Edit existing avatars\n• Create new avatars\n• Delete unwanted avatars\n• View detailed stats",
                        inline: true,
                    },
                ]);

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
                        theme: "dark", // Add theme support
                        layout: avatars.length > 4 ? "grid" : "vertical",
                    }
                );

                const arrayBuffer = await characterImage.arrayBuffer();
                imageBuffer = Buffer.from(arrayBuffer);
                mainEmbed.setImage("attachment://avatars.png");
            } catch (renderError) {
                console.warn("Failed to render character image:", renderError);
                mainEmbed.addFields([
                    {
                        name: "⚠️ Notice",
                        value: "Character preview unavailable",
                        inline: false,
                    },
                ]);
            }
        } else {
            mainEmbed
                .setDescription(
                    loc.ui.avatars.no_avatars +
                        "\n\n🚀 **Get started by creating your first avatar!**"
                )
                .addFields([
                    {
                        name: "✨ Why Create Avatars?",
                        value: "• Roleplay as different characters\n• Level up and gain experience\n• Customize appearance and stats\n• Participate in adventures",
                        inline: false,
                    },
                ]);
        }

        // Enhanced button components
        const createButton = new ButtonBuilder()
            .setCustomId("createAvatar")
            .setLabel(`✨ ${loc.ui.avatars.create_label}`)
            .setStyle(ButtonStyle.Success)
            .setEmoji("🎭");

        const refreshButton = new ButtonBuilder()
            .setCustomId("refreshAvatars")
            .setLabel("🔄 Refresh")
            .setStyle(ButtonStyle.Secondary);

        const helpButton = new ButtonBuilder()
            .setCustomId("avatarHelp")
            .setLabel("❓ Help")
            .setStyle(ButtonStyle.Secondary);

        // Enhanced select menu for avatars
        const components: any[] = [];

        if (avatars.length > 0) {
            const avatarSelectMenu = new StringSelectMenuBuilder()
                .setCustomId("avatarSelect")
                .setPlaceholder("🎭 Select an avatar to manage...")
                .addOptions(
                    avatars.slice(0, 25).map((avatar) => ({
                        label: `${avatar.get("name")} (Level ${avatar.get(
                            "level"
                        )})`,
                        value: `${avatar.get("id")}`,
                        description: `${avatar.get(
                            "species"
                        )} • Click to edit or view details`,
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
                    .setLabel("◀️ Previous")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true);

                const nextButton = new ButtonBuilder()
                    .setCustomId("avatarPageNext")
                    .setLabel("Next ▶️")
                    .setStyle(ButtonStyle.Secondary);

                components.push(
                    new ActionRowBuilder().addComponents(prevButton, nextButton)
                );
            }
        }

        // Main action buttons
        components.push(
            new ActionRowBuilder().addComponents(
                createButton,
                refreshButton,
                helpButton
            )
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

        if (interaction instanceof ChatInputCommandInteraction) {
            if (interaction.deferred) {
                await interaction.editReply(messageOptions);
            } else {
                await interaction.reply(messageOptions);
            }
        } else {
            await interaction.update(messageOptions);
        }
    } catch (error) {
        console.error("Error in avatar command:", error);

        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Something went wrong")
            .setDescription("Failed to load avatars. Please try again.")
            .setColor("Red")
            .setTimestamp();

        if (interaction instanceof ChatInputCommandInteraction) {
            if (interaction.deferred) {
                await interaction.editReply({
                    embeds: [errorEmbed],
                    components: [],
                });
            } else {
                await interaction.reply({
                    embeds: [errorEmbed],
                    ephemeral: true,
                });
            }
        } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
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
