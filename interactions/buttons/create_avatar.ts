import {
    ActionRowBuilder,
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    StringSelectMenuBuilder,
    ModalSubmitInteraction,
    StringSelectMenuInteraction,
} from "discord.js";
import { Avatar } from "../../utils/models";
import displays from "../../db/displays.json";
import { createErrorEmbed, YukamiEmbed } from "../../utils/embeds";
import { type Handler } from "../../events/interactionCreate";

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
                error: "Le bracket doit obligatoirement contenir 'text",
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
            return { valid: false, error: "Le lien ne peut pas etre vide" };
        }

        try {
            new URL(url);
        } catch {
            return { valid: false, error: "Format du lien invalide" };
        }

        const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
        const hasValidExtension = validExtensions.some((ext) =>
            url.toLowerCase().includes(ext)
        );

        if (!hasValidExtension) {
            return {
                valid: false,
                error: "L'URL doit pointer vers une image (.jpg, .png, .gif, .webp)",
            };
        }

        return { valid: true };
    },
};

/**
 * Create and show the avatar creation modal
 * @param interaction - The button interaction that triggered avatar creation
 */
export default (async function createAvatar(interaction, avatars, callback) {
    const modal = new ModalBuilder()
        .setCustomId(`avatar_modal_${interaction.user.id}`)
        .setTitle("🎭 Créer un personnage");

    // Avatar name input
    const nameInput = new TextInputBuilder()
        .setCustomId("avatar_name")
        .setLabel("Nom de l'avatar")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Entrez le nom de l'avatar (max 32 chars)")
        .setRequired(true)
        .setMaxLength(32);

    // Bracket format input with helpful placeholder
    const bracketInput = new TextInputBuilder()
        .setCustomId("avatar_bracket")
        .setLabel("Format du bracket")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Exemple: "[text]" ou "(text)" - doit inclure "text"')
        .setRequired(true)
        .setMaxLength(50);

    // Avatar image URL input
    const iconInput = new TextInputBuilder()
        .setCustomId("avatar_icon")
        .setLabel("Lien vers l'image de l'avatar")
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
        await interaction.showModal(modal, { withResponse: true });
    } catch (error) {
        console.error("Error showing avatar creation modal:", error);

        const errorEmbed = createErrorEmbed(
            "Quelque chose s'est mal passé !",
            "Une erreur s'est produite lors de la création de l'avatar."
        );

        callback({ embeds: [errorEmbed] });
    }
} as Handler<ButtonInteraction>);

/**
 * Handle modal submission for avatar creation
 * @param interaction - Modal submit interaction
 */
export async function handleAvatarModalSubmission(
    interaction: ModalSubmitInteraction
) {
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
        errors.push(`❌ Lien de l'image : ${iconValidation.error}`);

    // Check for duplicate avatar name
    try {
        const existingAvatar = await Avatar.findOne({
            where: {
                userId: interaction.user.id,
                name: name,
            },
        });

        if (existingAvatar) {
            errors.push("❌ Tu as déjà un avatar avec ce nom.");
        }
    } catch (error) {
        console.error("Error checking for existing avatar:", error);
        errors.push("❌ La base de données a rencontré une erreur");
    }

    // If there are validation errors, show them
    if (errors.length > 0) {
        const errorEmbed = createErrorEmbed(
            "Des erreurs ont été rencontrées !",
            errors.join("\n")
        );

        await interaction.editReply({ embeds: [errorEmbed] });
        return;
    }

    // Create preview embed
    const previewEmbed = new YukamiEmbed()
        .setBotFooter()
        .setTimestamp()
        .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL(),
        })
        .setTitle("🎭 Prévisualisation")
        .setDescription("Attributez une race pour continuer.")
        .addFields([
            { name: "Nom", value: name, inline: true },
            { name: "Bracket", value: bracket, inline: true },
            {
                name: "Exemple de message",
                value: bracket.replace("text", "Hello there!"),
                inline: false,
            },
        ])
        .setThumbnail(iconUrl);

    // Create species selection menu
    const speciesOptions = Object.entries(displays).map(
        ([key, displayName]) => ({
            label: displayName as string,
            value: key,
            description: `Créer un avatar ${displayName}`,
        })
    );

    const speciesSelectMenu = new StringSelectMenuBuilder()
        .setCustomId(`species_select_${interaction.user.id}`)
        .setPlaceholder("🐾 Choisissez sa race...")
        .addOptions(speciesOptions.slice(0, 25)); // Discord limit

    const actionRow =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            speciesSelectMenu
        );

    try {
        await interaction.editReply({
            embeds: [previewEmbed],
            components: [actionRow],
        });
    } catch (error) {
        console.error("Error showing species selection:", error);

        const errorEmbed = createErrorEmbed(
            "Quelque chose s'est mal passé !",
            "Nous n'avons pas pu afficher la liste des espèces."
        );

        await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    }
}
