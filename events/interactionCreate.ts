import eventBuilder from "../utils/eventBuilder";
import { Avatar } from "../utils/models";
import { Interaction } from "discord.js";
import {
    handleAvatarModalSubmission,
    handleSpeciesSelection,
} from "../interactions/createAvatar";
import {
    createErrorEmbed,
    createCommandNotFoundEmbed,
    createLoadingEmbed,
    EmbedIntegrationExamples,
} from "../utils/embeds";

/**
 * Interaction Create Event Handler with Enhanced Embed Support
 *
 * Central handler for all Discord interactions (commands, buttons, modals, etc.)
 * with optimized error handling, caching, and consistent embed styling.
 */

// Cache for user avatars to reduce database queries
const avatarCache = new Map<
    string,
    {
        avatars: Avatar[];
        expiresAt: number;
    }
>();

const CACHE_TTL = parseInt(process.env.CACHE_TTL || "300000"); // Default 5 minutes

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

// Clean up expired cache entries periodically
setInterval(() => {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [userId, data] of avatarCache.entries()) {
        if (data.expiresAt <= now) {
            avatarCache.delete(userId);
            cleanedCount++;
        }
    }

    if (cleanedCount > 0) {
        console.log(`🧹 Cleaned ${cleanedCount} expired avatar cache entries`);
    }
}, CACHE_TTL);

/**
 * Handle different interaction types with enhanced error handling
 */
export default eventBuilder<"interactionCreate">(
    async (interaction: Interaction) => {
        const startTime = Date.now();

        // Performance monitoring
        const perfLogger = {
            command: "",
            userId: "user" in interaction ? interaction.user.id : "unknown",
            guildId: "guildId" in interaction ? interaction.guildId : "dm",
        };

        try {
            // Handle slash commands
            if (interaction.isChatInputCommand()) {
                perfLogger.command = interaction.commandName;
                await handleSlashCommand(interaction);
            }
            // Handle button interactions
            else if (interaction.isButton()) {
                perfLogger.command = `button:${interaction.customId}`;
                await handleButtonInteraction(interaction);
            }
            // Handle select menu interactions
            else if (interaction.isAnySelectMenu()) {
                perfLogger.command = `select:${interaction.customId}`;
                await handleSelectMenuInteraction(interaction);
            }
            // Handle modal submissions
            else if (interaction.isModalSubmit()) {
                perfLogger.command = `modal:${interaction.customId}`;
                await handleModalSubmission(interaction);
            }

            // Performance logging
            const duration = Date.now() - startTime;
            if (duration > 1000) {
                console.warn(
                    `⚠️ Slow interaction: ${perfLogger.command} took ${duration}ms (User: ${perfLogger.userId}, Guild: ${perfLogger.guildId})`
                );
            } else if (
                process.env.NODE_ENV === "development" &&
                duration > 500
            ) {
                console.log(
                    `📊 Interaction timing: ${perfLogger.command} took ${duration}ms`
                );
            }
        } catch (error) {
            console.error("❌ Error in interactionCreate:", {
                command: perfLogger.command,
                userId: perfLogger.userId,
                guildId: perfLogger.guildId,
                error: error,
            });
            await handleInteractionError(interaction, error as Error);
        }
    }
);

/**
 * Handle slash command interactions with enhanced error handling
 */
async function handleSlashCommand(interaction: any): Promise<void> {
    const { commandName } = interaction;

    try {
        // Show loading state for commands that might take time
        const loadingCommands = ["avatar", "travel", "rr"];
        if (loadingCommands.includes(commandName)) {
            await interaction.deferReply({ ephemeral: false });
        }

        // Dynamic import for better performance
        const { default: handler } = await import(
            `../interactions/${commandName}.ts`
        );

        // Defer reply if not already deferred and command needs it
        if (!interaction.deferred && !interaction.replied) {
            const needsDefer = await checkIfCommandNeedsDefer(commandName);
            if (needsDefer) {
                await interaction.deferReply({ ephemeral: false });
            }
        }

        // Get user avatars for commands that need them
        const avatarCommands = ["avatar", "travel", "editAvatar"];
        const avatars = avatarCommands.includes(commandName)
            ? await getUserAvatars(interaction.user.id)
            : [];

        // Execute command handler
        await handler(interaction, { now: Date.now() }, avatars);

        // Clear cache if command modified user data
        const modifyingCommands = [
            "createAvatar",
            "editAvatar",
            "deleteAvatar",
        ];
        if (modifyingCommands.includes(commandName)) {
            clearAvatarCache(interaction.user.id);
        }
    } catch (importError) {
        console.error(
            `❌ Command handler not found: ${commandName}`,
            importError
        );

        const errorEmbed = createCommandNotFoundEmbed(commandName);

        if (interaction.deferred) {
            await interaction.editReply({ embeds: [errorEmbed] });
        } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
}

/**
 * Handle button interactions with enhanced routing
 */
async function handleButtonInteraction(interaction: any): Promise<void> {
    const { customId } = interaction;

    await interaction.deferReply();

    // Special handling for avatar-related buttons
    if (customId === "createAvatar") {
        const { default: createAvatar } = await import(
            "../interactions/createAvatar"
        );
        await createAvatar(interaction);
        return;
    }

    // Handle paginated avatar buttons
    if (customId.startsWith("avatarPage")) {
        const { default: avatarHandler } = await import(
            "../interactions/avatar"
        );
        await avatarHandler(interaction);
        return;
    }

    // Handle refresh buttons
    if (customId === "refreshAvatars") {
        clearAvatarCache(interaction.user.id);
        const { default: avatarHandler } = await import(
            "../interactions/avatar"
        );
        await avatarHandler(interaction);
        return;
    }

    try {
        // Dynamic import for other button handlers
        const { default: handler } = await import(
            `../interactions/${customId}.ts`
        );

        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferUpdate();
        }

        const avatars = await getUserAvatars(interaction.user.id);
        await handler(interaction, avatars);
    } catch (importError) {
        console.error(`❌ Button handler not found: ${customId}`, importError);

        const errorEmbed = createErrorEmbed(
            "Action Unavailable",
            "This action is currently unavailable or has expired.",
            process.env.NODE_ENV === "production"
                ? undefined
                : "Handler not found"
        );

        try {
            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({
                    embeds: [errorEmbed],
                    ephemeral: true,
                });
            }
        } catch (replyError) {
            console.error("Failed to send button error message:", replyError);
        }
    }
}

/**
 * Handle select menu interactions with enhanced routing
 */
async function handleSelectMenuInteraction(interaction: any): Promise<void> {
    const { customId, values } = interaction;

    await interaction.deferReply();
    // Handle species selection for avatar creation
    if (customId.startsWith("species_select_")) {
        await handleSpeciesSelection(interaction);
        return;
    }

    // Handle avatar selection
    if (customId === "avatarSelect") {
        const { default: avatarSelectHandler } = await import(
            "../interactions/avatarSelect"
        );
        await avatarSelectHandler(interaction);
        return;
    }

    // Handle reaction role selection
    if (customId.startsWith("select_rr_")) {
        const { default: rrHandler } = await import(
            "../interactions/select_rr"
        );
        await rrHandler(interaction);
        return;
    }

    try {
        const baseCustomId = customId.split("_")[0]; // Extract base ID
        const { default: handler } = await import(
            `../interactions/${baseCustomId}.ts`
        );

        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferUpdate();
        }

        const avatars = await getUserAvatars(interaction.user.id);
        await handler(interaction, avatars);
    } catch (importError) {
        console.error(
            `❌ Select menu handler not found: ${customId}`,
            importError
        );

        const errorEmbed = createErrorEmbed(
            "Selection Unavailable",
            "This selection is currently unavailable.",
            process.env.NODE_ENV === "production"
                ? undefined
                : "Handler not found"
        );

        try {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        } catch (replyError) {
            console.error("Failed to send select error message:", replyError);
        }
    }
}

/**
 * Handle modal submissions with enhanced routing
 */
async function handleModalSubmission(interaction: any): Promise<void> {
    const { customId } = interaction;

    // Handle avatar creation modal
    if (customId.startsWith("avatar_modal_")) {
        await handleAvatarModalSubmission(interaction);
        return;
    }

    // Handle welcome message modal
    if (customId.startsWith("welcome_modal_")) {
        const { default: welcomeHandler } = await import(
            "../interactions/welcome"
        );
        await welcomeHandler(interaction);
        return;
    }

    // Handle name/URL edit modals
    if (
        customId.startsWith("edit_name_") ||
        customId.startsWith("edit_avatar_url_")
    ) {
        const handlerName = customId.split("_").slice(0, 2).join("_");
        try {
            const { default: handler } = await import(
                `../interactions/${handlerName}.ts`
            );
            await handler(interaction);
            clearAvatarCache(interaction.user.id);
        } catch (error) {
            console.error(`Modal handler error for ${customId}:`, error);
            const errorEmbed = EmbedIntegrationExamples.handleInteractionError(
                error as Error,
                `modal:${customId}`
            );
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
        return;
    }

    // Log unhandled modals
    console.warn(`⚠️ Unhandled modal submission: ${customId}`);

    const errorEmbed = createErrorEmbed(
        "Modal Handler Missing",
        "This form submission could not be processed.",
        process.env.NODE_ENV === "production"
            ? undefined
            : `Missing handler for: ${customId}`
    );

    try {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    } catch (replyError) {
        console.error("Failed to send modal error message:", replyError);
    }
}

/**
 * Handle interaction errors gracefully with enhanced embed support
 */
async function handleInteractionError(
    interaction: Interaction,
    error: Error
): Promise<void> {
    // Determine error type and create appropriate embed
    let errorEmbed;

    if (error.message.includes("Missing Permissions")) {
        errorEmbed = createErrorEmbed(
            "Permission Error",
            "The bot doesn't have the necessary permissions to complete this action.",
            "Please check the bot's role permissions."
        );
    } else if (error.message.includes("Unknown")) {
        errorEmbed = createErrorEmbed(
            "Resource Not Found",
            "The requested resource could not be found.",
            "It may have been deleted or moved."
        );
    } else if (error.message.includes("Rate limit")) {
        errorEmbed = createErrorEmbed(
            "Rate Limited",
            "Too many requests. Please wait a moment and try again.",
            "Discord has temporary rate limits to prevent spam."
        );
    } else {
        errorEmbed = createErrorEmbed(
            "Unexpected Error",
            "Something went wrong while processing your request.",
            process.env.NODE_ENV === "production"
                ? "If this persists, please contact support."
                : error.message
        );
    }

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
        if (!interaction.isCommand()) return;

        // Last resort: try to send a simple text message
        try {
            if (!interaction.replied && interaction.isRepliable()) {
                await interaction.reply({
                    content:
                        "❌ An error occurred and could not be displayed properly.",
                    ephemeral: true,
                });
            }
        } catch (finalError) {
            console.error(
                "❌ Complete failure to respond to interaction:",
                finalError
            );
        }
    }
}

/**
 * Check if a command needs to be deferred based on its complexity
 */
async function checkIfCommandNeedsDefer(commandName: string): Promise<boolean> {
    const heavyCommands = [
        "avatar", // Renders images
        "travel", // Complex calculations
        "rr", // Database operations
        "welcome", // Role validation
    ];

    return heavyCommands.includes(commandName);
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats() {
    const now = Date.now();
    let activeEntries = 0;
    let expiredEntries = 0;

    for (const [, data] of avatarCache.entries()) {
        if (data.expiresAt > now) {
            activeEntries++;
        } else {
            expiredEntries++;
        }
    }

    return {
        total: avatarCache.size,
        active: activeEntries,
        expired: expiredEntries,
        hitRatio: 0, // Could be calculated with additional tracking
    };
}
