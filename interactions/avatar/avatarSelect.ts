import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    StringSelectMenuInteraction,
} from "discord.js";
import { Avatar } from "../../utils/models";
import { renderComponentToPng } from "../../utils/render";
import displays from "../../db/displays.json";
import stats from "../../db/stats.json";

export default async function avatarSelect(
    interaction: StringSelectMenuInteraction
) {
    interaction.deleteReply();
    try {
        const avatarId = interaction.values[0];

        // Fetch avatar with error handling
        const avatar = await Avatar.findByPk(avatarId);

        if (!avatar) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Avatar Not Found")
                .setDescription(
                    "This avatar no longer exists. Please refresh the list."
                )
                .setColor("Red");

            await interaction.message.edit({
                embeds: [errorEmbed],
                components: [],
            });
            return;
        }

        // Verify ownership
        if (avatar.get("userId") !== interaction.user.id) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Access Denied")
                .setDescription("You can only edit your own avatars.")
                .setColor("Red");

            await interaction.message.edit({
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
        const avatarEmbed = new EmbedBuilder()
            .setTitle(`🎭 ${name}`)
            .setDescription(
                `**Species:** ${
                    displays[species as keyof typeof displays] || species
                }\n` +
                    `**Level:** ${level}\n` +
                    `**Bracket:** \`${bracket}\`\n` +
                    `**Created:** <t:${Math.floor(
                        createdAt.getTime() / 1000
                    )}:R>`
            )
            .setThumbnail(iconUrl)
            .setColor("#5865F2")
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setFooter({
                text: `Avatar ID: ${avatarId} • ${
                    process.env.NAME ?? "Yukami Bot"
                }`,
                iconURL: interaction.client.user.displayAvatarURL(),
            })
            .setTimestamp();

        // Add stats fields
        if (Object.keys(calculatedStats).length > 0) {
            const statFields = Object.entries(calculatedStats)
                .map(
                    ([statName, value]) =>
                        `**${capitalize(statName)}:** ${value}`
                )
                .join("\n");

            avatarEmbed.addFields([
                {
                    name: "📊 Current Stats",
                    value: statFields,
                    inline: true,
                },
            ]);
        }

        // Add usage example
        avatarEmbed.addFields([
            {
                name: "💬 Usage Example",
                value: `\`${bracket.replace("text", "Hello everyone!")}\``,
                inline: true,
            },
        ]);

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

        // Action buttons
        const editNameButton = new ButtonBuilder()
            .setCustomId(`edit_name_${avatarId}`)
            .setLabel("✏️ Edit Name")
            .setStyle(ButtonStyle.Secondary);

        const editBracketButton = new ButtonBuilder()
            .setCustomId(`edit_bracket_${avatarId}`)
            .setLabel("🔧 Edit Bracket")
            .setStyle(ButtonStyle.Secondary);

        const editAvatarButton = new ButtonBuilder()
            .setCustomId(`edit_avatar_url_${avatarId}`)
            .setLabel("🖼️ Edit Image")
            .setStyle(ButtonStyle.Secondary);

        const deleteButton = new ButtonBuilder()
            .setCustomId(`delete_avatar_${avatarId}`)
            .setLabel("🗑️ Delete")
            .setStyle(ButtonStyle.Danger);

        const backButton = new ButtonBuilder()
            .setCustomId("back")
            .setLabel("◀️ Back")
            .setStyle(ButtonStyle.Primary);

        // Level up button (if applicable)
        const levelUpButton = new ButtonBuilder()
            .setCustomId(`levelup_${avatarId}`)
            .setLabel("⬆️ Level Up")
            .setStyle(ButtonStyle.Success)
            .setDisabled(level >= 100); // Max level cap

        const components = [
            new ActionRowBuilder()
                .addComponents(
                    editNameButton,
                    editBracketButton,
                    editAvatarButton
                )
                .toJSON(),
            new ActionRowBuilder()
                .addComponents(levelUpButton, deleteButton, backButton)
                .toJSON(),
        ];

        await interaction.message.edit({
            embeds: [avatarEmbed],
            components,
            files: imageBuffer
                ? [{ attachment: imageBuffer, name: "character.png" }]
                : [],
        });
    } catch (error) {
        console.error("Error in avatar select:", error);

        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Error Loading Avatar")
            .setDescription(
                "Something went wrong while loading this avatar. Please try again."
            )
            .setColor("Red");

        await interaction.message.edit({
            embeds: [errorEmbed],
            components: [],
        });
    }
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
