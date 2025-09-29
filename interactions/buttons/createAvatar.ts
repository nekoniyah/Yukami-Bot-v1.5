import {
    ActionRowBuilder,
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    StringSelectMenuBuilder,
    EmbedBuilder,
    ModalSubmitInteraction,
    StringSelectMenuInteraction,
} from "discord.js";
import { Avatar } from "../../utils/models";
import displays from "../../db/displays.json";

/**
 * Avatar Creation System
 *
 * Modern implementation using Discord modals instead of message collectors
 * for better UX, security, and maintainability.
 */

// Cache for temporary avatar data during creation process
const avatarCreationCache = new Map<
    string,
    {
        name: string;
        bracket: string;
        iconUrl: string;
        expiresAt: number;
    }
>();

// Clean up expired cache entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [userId, data] of avatarCreationCache.entries()) {
        if (data.expiresAt < now) {
            avatarCreationCache.delete(userId);
        }
    }
}, 5 * 60 * 1000);

/**
 * Validation functions
 */
const validators = {
    /**
     * Validate avatar name
     * @param name - The proposed avatar name
     * @returns Validation result
     */
    name: (name: string): { valid: boolean; error?: string } => {
        if (!name || name.trim().length === 0) {
            return { valid: false, error: "Name cannot be empty" };
        }
        if (name.length > 32) {
            return {
                valid: false,
                error: "Name must be 32 characters or less",
            };
        }
        if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
            return { valid: false, error: "Name contains invalid characters" };
        }
        return { valid: true };
    },

    /**
     * Validate bracket format
     * @param bracket - The proposed bracket format
     * @returns Validation result
     */
    bracket: (bracket: string): { valid: boolean; error?: string } => {
        if (!bracket || bracket.trim().length === 0) {
            return { valid: false, error: "Bracket cannot be empty" };
        }
        if (!bracket.includes("text")) {
            return {
                valid: false,
                error: "Bracket must contain the word 'text'",
            };
        }
        const parts = bracket.split("text");
        if (parts.length !== 2) {
            return {
                valid: false,
                error: "Bracket must contain exactly one 'text' placeholder",
            };
        }
        return { valid: true };
    },

    /**
     * Validate image URL
     * @param url - The proposed image URL
     * @returns Validation result
     */
    imageUrl: (url: string): { valid: boolean; error?: string } => {
        if (!url || url.trim().length === 0) {
            return { valid: false, error: "Image URL cannot be empty" };
        }

        try {
            new URL(url);
        } catch {
            return { valid: false, error: "Invalid URL format" };
        }

        const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
        const hasValidExtension = validExtensions.some((ext) =>
            url.toLowerCase().includes(ext)
        );

        if (!hasValidExtension) {
            return {
                valid: false,
                error: "URL must point to an image (.jpg, .png, .gif, .webp)",
            };
        }

        return { valid: true };
    },
};

/**
 * Create and show the avatar creation modal
 * @param interaction - The button interaction that triggered avatar creation
 */
export default async function createAvatar(
    interaction: ButtonInteraction
): Promise<void> {
    const modal = new ModalBuilder()
        .setCustomId(`avatar_modal_${interaction.user.id}`)
        .setTitle("🎭 Create New Avatar");

    // Avatar name input
    const nameInput = new TextInputBuilder()
        .setCustomId("avatar_name")
        .setLabel("Avatar Name")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Enter your character's name (max 32 chars)")
        .setRequired(true)
        .setMaxLength(32);

    // Bracket format input with helpful placeholder
    const bracketInput = new TextInputBuilder()
        .setCustomId("avatar_bracket")
        .setLabel("Message Bracket Format")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Example: "[text]" or "(text)" - must include "text"')
        .setRequired(true)
        .setMaxLength(50);

    // Avatar image URL input
    const iconInput = new TextInputBuilder()
        .setCustomId("avatar_icon")
        .setLabel("Avatar Image URL")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("https://example.com/avatar.png")
        .setRequired(true)
        .setMaxLength(500);

    // Create action rows for modal
    const rows = [
        new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(bracketInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(iconInput),
    ];

    modal.addComponents(...rows);

    try {
        await interaction.showModal(modal);
    } catch (error) {
        console.error("Error showing avatar creation modal:", error);

        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Error")
            .setDescription(
                "Failed to open avatar creation form. Please try again."
            )
            .setColor("Red");

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}

/**
 * Handle modal submission for avatar creation
 * @param interaction - Modal submit interaction
 */
export async function handleAvatarModalSubmission(
    interaction: ModalSubmitInteraction
): Promise<void> {
    // Extract form data
    const name = interaction.fields.getTextInputValue("avatar_name").trim();
    const bracket = interaction.fields
        .getTextInputValue("avatar_bracket")
        .trim();
    const iconUrl = interaction.fields.getTextInputValue("avatar_icon").trim();

    // Validate all inputs
    const nameValidation = validators.name(name);
    const bracketValidation = validators.bracket(bracket);
    const iconValidation = validators.imageUrl(iconUrl);

    const errors: string[] = [];

    if (!nameValidation.valid) errors.push(`❌ Name: ${nameValidation.error}`);
    if (!bracketValidation.valid)
        errors.push(`❌ Bracket: ${bracketValidation.error}`);
    if (!iconValidation.valid)
        errors.push(`❌ Image URL: ${iconValidation.error}`);

    // Check for duplicate avatar name
    try {
        const existingAvatar = await Avatar.findOne({
            where: {
                userId: interaction.user.id,
                name: name,
            },
        });

        if (existingAvatar) {
            errors.push("❌ You already have an avatar with this name");
        }
    } catch (error) {
        console.error("Error checking for existing avatar:", error);
        errors.push("❌ Database error occurred");
    }

    // If there are validation errors, show them
    if (errors.length > 0) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Avatar Creation Failed")
            .setDescription(errors.join("\n"))
            .setColor("Red")
            .setFooter({
                text: "Please fix the errors and try again",
            })
            .setTimestamp();

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
    }

    // Store temporary data in cache
    avatarCreationCache.set(interaction.user.id, {
        name,
        bracket,
        iconUrl,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    // Create preview embed
    const previewEmbed = new EmbedBuilder()
        .setTitle("🎭 Avatar Preview")
        .setDescription("Review your avatar and select a species to continue.")
        .addFields([
            { name: "Name", value: name, inline: true },
            { name: "Bracket", value: bracket, inline: true },
            {
                name: "Preview Message",
                value: bracket.replace("text", "Hello there!"),
                inline: false,
            },
        ])
        .setThumbnail(iconUrl)
        .setColor("#5865F2")
        .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL(),
        })
        .setFooter({
            text: `${process.env.NAME || "Yukami Bot"} • Avatar System`,
            iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setTimestamp();

    // Create species selection menu
    const speciesOptions = Object.entries(displays).map(
        ([key, displayName]) => ({
            label: displayName as string,
            value: key,
            description: `Create a ${displayName} avatar`,
            emoji: getSpeciesEmoji(key), // Helper function for species emojis
        })
    );

    const speciesSelectMenu = new StringSelectMenuBuilder()
        .setCustomId(`species_select_${interaction.user.id}`)
        .setPlaceholder("🐾 Choose your avatar's species...")
        .addOptions(speciesOptions.slice(0, 25)); // Discord limit

    const actionRow =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            speciesSelectMenu
        );

    try {
        await interaction.reply({
            embeds: [previewEmbed],
            components: [actionRow],
            ephemeral: true,
        });
    } catch (error) {
        console.error("Error showing species selection:", error);

        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Error")
            .setDescription(
                "Failed to show species selection. Please try again."
            )
            .setColor("Red");

        await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    }
}

/**
 * Handle species selection for avatar creation
 * @param interaction - String select menu interaction
 */
export async function handleSpeciesSelection(
    interaction: StringSelectMenuInteraction
): Promise<void> {
    const userId = interaction.user.id;
    const selectedSpecies = interaction.values[0];

    // Get cached avatar data
    const avatarData = avatarCreationCache.get(userId);

    if (!avatarData) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Session Expired")
            .setDescription(
                "Your avatar creation session has expired. Please start over."
            )
            .setColor("Red");

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
    }

    try {
        // Create the avatar in database
        const newAvatar = await Avatar.create({
            userId: userId,
            name: avatarData.name,
            bracket: avatarData.bracket,
            icon: avatarData.iconUrl,
            species: selectedSpecies,
            level: 1,
        });

        // Clean up cache
        avatarCreationCache.delete(userId);

        // Create success embed
        const successEmbed = new EmbedBuilder()
            .setTitle("🎉 Avatar Created Successfully!")
            .setDescription(
                `**${avatarData.name}** has been created as a ${
                    displays[selectedSpecies as keyof typeof displays]
                }!\n\n` +
                    `Try using your avatar by typing:\n\`${avatarData.bracket.replace(
                        "text",
                        "Hello everyone!"
                    )}\``
            )
            .addFields([
                { name: "Name", value: avatarData.name, inline: true },
                {
                    name: "Species",
                    value: displays[
                        selectedSpecies as keyof typeof displays
                    ] as string,
                    inline: true,
                },
                { name: "Level", value: "1", inline: true },
            ])
            .setThumbnail(avatarData.iconUrl)
            .setColor("Green")
            .setFooter({
                text: `Avatar ID: ${newAvatar.get("id")}`,
            })
            .setTimestamp();

        await interaction.update({
            embeds: [successEmbed],
            components: [], // Remove the selection menu
        });
    } catch (error) {
        console.error("Error creating avatar:", error);

        // Clean up cache even on error
        avatarCreationCache.delete(userId);

        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Creation Failed")
            .setDescription(
                "Failed to create your avatar. Please try again later."
            )
            .setColor("Red");

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}

/**
 * Get emoji for species (helper function)
 * @param species - Species key
 * @returns Appropriate emoji
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
        // Add more as needed
    };

    return emojiMap[species] || "✨";
}
