import eventBuilder from "../utils/eventBuilder";
import { Avatar } from "../utils/models";
import { EmbedBuilder, Interaction } from "discord.js";
import {
    handleAvatarModalSubmission,
    handleSpeciesSelection,
} from "../interactions/createAvatar";

/**
 * Interaction Create Event Handler
 *
 * Central handler for all Discord interactions (commands, buttons, modals, etc.)
 * with optimized error handling and caching.
 */

// Cache for user avatars to reduce database queries
const avatarCache = new Map<
    string,
    {
        avatars: Avatar[];
        expiresAt: number;
    }
>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get user avatars with caching
 * @param userId - Discord user ID
 * @returns User's avatars
 */
async function getUserAvatars(userId: string): Promise<Avatar[]> {
    // Check cache first
    const cached = avatarCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.avatars;
    }

    try {
        // Fetch from database
        const avatars = await Avatar.findAll({
            where: { userId },
            order: [["createdAt", "DESC"]], // Most recent first
        });

        // Cache the result
        avatarCache.set(userId, {
            avatars,
            expiresAt: Date.now() + CACHE_TTL,
        });

        return avatars;
    } catch (error) {
        console.error(`Error fetching avatars for user ${userId}:`, error);
        return [];
    }
}

/**
 * Clear avatar cache for a user (call when avatars are modified)
 * @param userId - Discord user ID
 */
export function clearAvatarCache(userId: string): void {
    avatarCache.delete(userId);
}

// Clean up expired cache entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [userId, data] of avatarCache.entries()) {
        if (data.expiresAt <= now) {
            avatarCache.delete(userId);
        }
    }
}, 5 * 60 * 1000);

/**
 * Handle different interaction types
 */
export default eventBuilder<"interactionCreate">(
    async (interaction: Interaction) => {
        const startTime = Date.now();

        try {
            // Handle slash commands
            if (interaction.isChatInputCommand()) {
                await handleSlashCommand(interaction);
            }
            // Handle button interactions
            else if (interaction.isButton()) {
                await handleButtonInteraction(interaction);
            }
            // Handle select menu interactions
            else if (interaction.isAnySelectMenu()) {
                await handleSelectMenuInteraction(interaction);
            }
            // Handle modal submissions
            else if (interaction.isModalSubmit()) {
                await handleModalSubmission(interaction);
            }

            // Log performance
            const duration = Date.now() - startTime;
            if (duration > 1000) {
                // Log slow interactions
                console.warn(
                    `⚠️ Slow interaction: ${interaction.type} took ${duration}ms`
                );
            }
        } catch (error) {
            console.error("❌ Error in interactionCreate:", error);
            await handleInteractionError(interaction, error);
        }
    }
);

/**
 * Handle slash command interactions
 */
async function handleSlashCommand(interaction: any): Promise<void> {
    const { commandName } = interaction;

    try {
        // Dynamic import for better performance
        const { default: handler } = await import(
            `../interactions/${commandName}.ts`
        );

        // Defer reply early to prevent timeout
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: false });
        }

        // Get user avatars
        const avatars = await getUserAvatars(interaction.user.id);

        // Execute command handler
        await handler(interaction, { now: Date.now() }, avatars);
    } catch (importError) {
        console.error(
            `❌ Command handler not found: ${commandName}`,
            importError
        );

        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Command Not Found")
            .setDescription(`The command \`/${commandName}\` is not available.`)
            .setColor("Red");

        if (interaction.deferred) {
            await interaction.editReply({ embeds: [errorEmbed] });
        } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
}

/**
 * Handle button interactions
 */
async function handleButtonInteraction(interaction: any): Promise<void> {
    const { customId } = interaction;

    // Special handling for avatar creation button
    if (customId === "createAvatar") {
        const { default: createAvatar } = await import(
            "../interactions/createAvatar"
        );
        await createAvatar(interaction);
        return;
    }

    try {
        // Dynamic import for other button handlers
        const { default: handler } = await import(
            `../interactions/${customId}.ts`
        );

        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: false });
        }

        const avatars = await getUserAvatars(interaction.user.id);
        await handler(interaction, avatars);
    } catch (importError) {
        console.error(`❌ Button handler not found: ${customId}`, importError);

        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Action Unavailable")
            .setDescription("This action is currently unavailable.")
            .setColor("Red");

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}

/**
 * Handle select menu interactions
 */
async function handleSelectMenuInteraction(interaction: any): Promise<void> {
    const { customId } = interaction;

    // Handle species selection for avatar creation
    if (customId.startsWith("species_select_")) {
        await handleSpeciesSelection(interaction);
        return;
    }

    try {
        const baseCustomId = customId.split("_")[0]; // Extract base ID
        const { default: handler } = await import(
            `../interactions/${baseCustomId}.ts`
        );

        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: false });
        }

        const avatars = await getUserAvatars(interaction.user.id);
        await handler(interaction, avatars);
    } catch (importError) {
        console.error(
            `❌ Select menu handler not found: ${customId}`,
            importError
        );

        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Selection Unavailable")
            .setDescription("This selection is currently unavailable.")
            .setColor("Red");

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}

/**
 * Handle modal submissions
 */
async function handleModalSubmission(interaction: any): Promise<void> {
    const { customId } = interaction;

    // Handle avatar creation modal
    if (customId.startsWith("avatar_modal_")) {
        await handleAvatarModalSubmission(interaction);
        return;
    }

    // Handle other modal types as needed
    console.warn(`⚠️ Unhandled modal submission: ${customId}`);
}

/**
 * Handle interaction errors gracefully
 */
async function handleInteractionError(
    interaction: Interaction,
    error: any
): Promise<void> {
    const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Something went wrong")
        .setDescription("An unexpected error occurred. Please try again later.")
        .setColor("Red")
        .setFooter({
            text: "If this persists, please contact support",
        })
        .setTimestamp();

    try {
        if (interaction.isRepliable()) {
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({
                    embeds: [errorEmbed],
                    ephemeral: true,
                });
            }
        }
    } catch (replyError) {
        console.error("❌ Failed to send error message:", replyError);
    }
}
