// events/interactionCreate.ts - Enhanced version with folder support
import eventBuilder from "../utils/eventBuilder";
import { Avatar } from "../utils/models";
import {
    AnySelectMenuInteraction,
    AutocompleteInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    Interaction,
    ModalSubmitInteraction,
    StringSelectMenuInteraction,
} from "discord.js";
import {
    handleAvatarModalSubmission,
    handleSpeciesSelection,
} from "../interactions/buttons/createAvatar";
import { createErrorEmbed, createCommandNotFoundEmbed } from "../utils/embeds";
import fs from "fs/promises";
import path from "path";

/**
 * Enhanced Interaction Create Event Handler with Folder Support
 *
 * Features:
 * - Recursive interaction handler loading
 * - Dynamic import with fallback search
 * - Enhanced caching and performance monitoring
 * - Comprehensive error handling
 */

// Global interaction handler registry
const interactionHandlers = new Map<string, any>();
const handlerLoadTime = new Map<string, number>();

// Cache for user avatars
const avatarCache = new Map<string, { avatars: Avatar[]; expiresAt: number }>();
const CACHE_TTL = parseInt(process.env.CACHE_TTL || "300000");

/**
 * Recursively load interaction handlers from directories
 */
async function loadInteractionHandlers(): Promise<void> {
    const interactionPath = path.join(__dirname, "..", "interactions");

    async function loadFromDirectory(
        dirPath: string,
        prefix = ""
    ): Promise<void> {
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);

                if (entry.isDirectory()) {
                    // Recursively load from subdirectories
                    const newPrefix = prefix
                        ? `${prefix}/${entry.name}`
                        : entry.name;
                    await loadFromDirectory(fullPath, newPrefix);
                } else if (entry.name.endsWith(".ts")) {
                    const handlerName = prefix
                        ? `${prefix}/${path.basename(entry.name, ".ts")}`
                        : path.basename(entry.name, ".ts");

                    try {
                        const startTime = Date.now();
                        const { default: handler } = await import(fullPath);

                        if (handler) {
                            interactionHandlers.set(handlerName, handler);
                            handlerLoadTime.set(
                                handlerName,
                                Date.now() - startTime
                            );

                            // Only register without prefix for NON-autocomplete handlers
                            // and only for root-level handlers
                            const simpleName = path.basename(entry.name, ".ts");
                            if (
                                !prefix &&
                                !interactionHandlers.has(simpleName)
                            ) {
                                interactionHandlers.set(simpleName, handler);
                            } else if (
                                prefix &&
                                prefix !== "autocomplete" &&
                                !interactionHandlers.has(simpleName)
                            ) {
                                // For non-autocomplete subdirectory handlers, register without prefix
                                // but with lower priority (check if it doesn't exist first)
                                if (!interactionHandlers.has(simpleName)) {
                                    interactionHandlers.set(
                                        simpleName,
                                        handler
                                    );
                                }
                            }

                            console.log(
                                `✅ Loaded interaction handler: ${handlerName}`
                            );
                        }
                    } catch (error) {
                        console.error(
                            `❌ Failed to load handler ${handlerName}:`,
                            error
                        );
                    }
                }
            }
        } catch (error) {
            console.error(
                `❌ Failed to read interactions directory ${dirPath}:`,
                error
            );
        }
    }

    console.log("🎮 Loading interaction handlers...");
    await loadFromDirectory(interactionPath);
    console.log(`🎉 Loaded ${interactionHandlers.size} interaction handlers`);
}

/**
 * Get interaction handler with intelligent fallback search and proper priority
 */
function getInteractionHandler(
    identifier: string,
    interactionType?: string
): any {
    // For autocomplete interactions, look specifically for autocomplete handlers
    if (interactionType === "autocomplete") {
        const autocompletePath = `autocomplete/${identifier}`;
        if (interactionHandlers.has(autocompletePath)) {
            return interactionHandlers.get(autocompletePath);
        }
        return null; // Don't fallback for autocomplete
    }

    // For slash commands, prioritize main command handlers over autocomplete
    if (interactionType === "slash" || !interactionType) {
        // Try main command paths first
        const mainPaths = [
            `${identifier}/${identifier}`, // avatar/avatar
            `commands/${identifier}`,
            `slash/${identifier}`,
        ];

        for (const path of mainPaths) {
            if (interactionHandlers.has(path)) {
                return interactionHandlers.get(path);
            }
        }

        // Try exact match, but skip if it's an autocomplete handler
        if (interactionHandlers.has(identifier)) {
            const handler = interactionHandlers.get(identifier);
            // Check if this might be an autocomplete handler by checking the function name
            if (handler.name && handler.name.includes("autocomplete")) {
                // Skip autocomplete handlers for slash commands
                console.log(
                    `Skipping autocomplete handler ${handler.name} for slash command`
                );
            } else {
                return handler;
            }
        }
    }

    // Try with common organization prefixes (excluding autocomplete for non-autocomplete requests)
    const organizationPrefixes = [
        "commands",
        "buttons",
        "modals",
        "selects",
        "menus",
        "slash",
        "context",
    ];

    // Add autocomplete only if specifically requested
    if (interactionType === "autocomplete") {
        organizationPrefixes.push("autocomplete");
    }

    for (const prefix of organizationPrefixes) {
        const prefixedId = `${prefix}/${identifier}`;
        if (interactionHandlers.has(prefixedId)) {
            return interactionHandlers.get(prefixedId);
        }
    }

    // Try to find by partial match (for dynamic IDs with parameters)
    for (const [key, handler] of interactionHandlers.entries()) {
        // Skip autocomplete handlers for non-autocomplete interactions
        if (
            interactionType !== "autocomplete" &&
            key.startsWith("autocomplete/")
        ) {
            continue;
        }

        const keyParts = key.split("/");
        const lastPart = keyParts[keyParts.length - 1];

        // Check if identifier starts with the handler name
        if (identifier.startsWith(lastPart)) {
            return handler;
        }

        // Check if the handler name is contained in the identifier
        if (identifier.includes(lastPart)) {
            return handler;
        }
    }

    return null;
}

/**
 * Get user avatars with enhanced caching
 */
async function getUserAvatars(userId: string): Promise<Avatar[]> {
    const cached = avatarCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.avatars;
    }

    try {
        const avatars = await Avatar.findAll({
            where: { userId },
            order: [["createdAt", "DESC"]],
        });

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
 * Clear avatar cache for a user
 */
export function clearAvatarCache(userId: string): void {
    avatarCache.delete(userId);
}

// Load handlers on startup
loadInteractionHandlers();

// Clean up expired cache entries
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

export default eventBuilder<"interactionCreate">(
    async (interaction: Interaction) => {
        const startTime = Date.now();

        const perfLogger = {
            command: "",
            userId: "user" in interaction ? interaction.user.id : "unknown",
            guildId: "guildId" in interaction ? interaction.guildId : "dm",
        };

        try {
            if (interaction.isChatInputCommand()) {
                perfLogger.command = interaction.commandName;
                await handleSlashCommand(interaction);
            } else if (interaction.isButton()) {
                perfLogger.command = `button:${interaction.customId}`;
                await handleButtonInteraction(interaction);
            } else if (interaction.isAnySelectMenu()) {
                perfLogger.command = `select:${interaction.customId}`;
                await handleSelectMenuInteraction(interaction);
            } else if (interaction.isModalSubmit()) {
                perfLogger.command = `modal:${interaction.customId}`;
                await handleModalSubmission(interaction);
            } else if (interaction.isAutocomplete()) {
                perfLogger.command = `autocomplete:${interaction.commandName}`;
                await handleAutocomplete(interaction);
            }

            const duration = Date.now() - startTime;
            if (duration > 1000) {
                console.warn(
                    `⚠️ Slow interaction: ${perfLogger.command} took ${duration}ms`
                );
            }
        } catch (error) {
            console.error("❌ Error in interactionCreate:", {
                command: perfLogger.command,
                userId: perfLogger.userId,
                guildId: perfLogger.guildId,
                error,
            });
            await handleInteractionError(interaction, error as Error);
        }
    }
);

/**
 * Enhanced slash command handler with dynamic loading
 */
async function handleSlashCommand(
    interaction: ChatInputCommandInteraction
): Promise<void> {
    const { commandName } = interaction;

    const handler = getInteractionHandler(commandName, "slash");

    if (!handler) {
        console.error(`❌ Command handler not found: ${commandName}`);
        const errorEmbed = createCommandNotFoundEmbed(commandName);

        if (interaction.deferred) {
            await interaction.editReply({ embeds: [errorEmbed] });
        } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
        return;
    }

    try {
        // Show loading state for commands that might take time
        const loadingCommands = ["avatar", "travel", "rr"];
        if (loadingCommands.includes(commandName) && !interaction.deferred) {
            await interaction.deferReply({ ephemeral: false });
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
    } catch (error) {
        console.error(`❌ Error executing command ${commandName}:`, error);
        await handleInteractionError(interaction, error as Error);
    }
}

/**
 * Enhanced button interaction handler
 */
async function handleButtonInteraction(
    interaction: ButtonInteraction
): Promise<void> {
    const { customId } = interaction;

    const handler = getInteractionHandler(customId, "button");

    if (!handler) {
        // Try legacy handling for specific patterns
        if (customId === "createAvatar") {
            const { default: createAvatar } = await import(
                "../interactions/buttons/createAvatar"
            );
            await interaction.deferReply();
            await createAvatar(interaction);
            return;
        }

        if (customId.startsWith("avatarPage")) {
            const { default: avatarHandler } = await import(
                "../interactions/avatar/avatar"
            );
            await interaction.deferReply();
            await avatarHandler(interaction);
            return;
        }

        console.error(`❌ Button handler not found: ${customId}`);
        const errorEmbed = createErrorEmbed(
            "Action Unavailable",
            "This action is currently unavailable or has expired."
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
        return;
    }

    try {
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferUpdate();
        }

        const avatars = await getUserAvatars(interaction.user.id);
        await handler(interaction, avatars);
    } catch (error) {
        console.error(`❌ Error in button handler ${customId}:`, error);
        await handleInteractionError(interaction, error as Error);
    }
}

/**
 * Enhanced select menu interaction handler
 */
async function handleSelectMenuInteraction(
    interaction: AnySelectMenuInteraction
): Promise<void> {
    const { customId } = interaction;

    // Handle special cases first
    if (customId.startsWith("species_select_")) {
        await interaction.deferReply();
        await handleSpeciesSelection(
            interaction as StringSelectMenuInteraction
        );
        return;
    }

    const handler = getInteractionHandler(customId);

    if (!handler) {
        console.error(`❌ Select menu handler not found: ${customId}`);
        const errorEmbed = createErrorEmbed(
            "Selection Unavailable",
            "This selection is currently unavailable."
        );

        try {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        } catch (replyError) {
            console.error("Failed to send select error message:", replyError);
        }
        return;
    }

    try {
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply();
        }

        const avatars = await getUserAvatars(interaction.user.id);
        await handler(interaction, avatars);
    } catch (error) {
        console.error(`❌ Error in select menu handler ${customId}:`, error);
        await handleInteractionError(interaction, error as Error);
    }
}

/**
 * Enhanced modal submission handler
 */
async function handleModalSubmission(
    interaction: ModalSubmitInteraction
): Promise<void> {
    const { customId } = interaction;

    // Handle special cases first
    if (customId.startsWith("avatar_modal_")) {
        await handleAvatarModalSubmission(interaction);
        return;
    }

    const handler = getInteractionHandler(customId);

    if (!handler) {
        console.error(`❌ Modal handler not found: ${customId}`);
        const errorEmbed = createErrorEmbed(
            "Submission Failed",
            "Unable to process your submission at this time."
        );

        try {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        } catch (replyError) {
            console.error("Failed to send modal error message:", replyError);
        }
        return;
    }

    try {
        await handler(interaction);
        clearAvatarCache(interaction.user.id);
    } catch (error) {
        console.error(`❌ Error in modal handler ${customId}:`, error);
        await handleInteractionError(interaction, error as Error);
    }
}

/**
 * Handle autocomplete interactions with proper routing
 */
async function handleAutocomplete(
    interaction: AutocompleteInteraction
): Promise<void> {
    const { commandName } = interaction;

    try {
        // Look specifically for autocomplete handlers first
        const handler = getInteractionHandler(commandName, "autocomplete");

        // Don't fall back to other handlers for autocomplete
        if (!handler) {
            console.error(
                `❌ Autocomplete handler not found: autocomplete/${commandName}`
            );
            console.log(
                `Available autocomplete handlers:`,
                Array.from(interactionHandlers.keys()).filter((k) =>
                    k.includes("autocomplete")
                )
            );
            await interaction.respond([]);
            return;
        }

        // Verify it's actually an autocomplete-specific handler
        if (typeof handler !== "function") {
            console.error(`❌ Invalid autocomplete handler for ${commandName}`);
            await interaction.respond([]);
            return;
        }

        await handler(interaction);
    } catch (error) {
        console.error(
            `❌ Error in autocomplete handler ${commandName}:`,
            error
        );
        try {
            if (!interaction.responded) {
                await interaction.respond([]);
            }
        } catch (respondError) {
            console.error(
                "Failed to respond to autocomplete interaction:",
                respondError
            );
        }
    }
}

/**
 * Handle interaction errors with user-friendly messages
 */
async function handleInteractionError(
    interaction: any,
    error: Error
): Promise<void> {
    console.error("❌ Interaction error:", error);

    const errorEmbed = createErrorEmbed(
        "Something went wrong!",
        "An unexpected error occurred while processing your request.",
        process.env.NODE_ENV === "production" ? undefined : error.message
    );

    try {
        if (interaction.deferred) {
            await interaction.editReply({ embeds: [errorEmbed] });
        } else if (!interaction.replied) {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    } catch (replyError) {
        console.error("Failed to send error message:", replyError);
    }
}

/**
 * Reload interaction handlers (for development)
 */
export async function reloadInteractionHandlers(): Promise<void> {
    interactionHandlers.clear();
    handlerLoadTime.clear();
    await loadInteractionHandlers();
}

/**
 * Get handler statistics (for monitoring)
 */
export function getHandlerStats(): any {
    return {
        totalHandlers: interactionHandlers.size,
        averageLoadTime:
            Array.from(handlerLoadTime.values()).reduce((a, b) => a + b, 0) /
            handlerLoadTime.size,
        cacheSize: avatarCache.size,
        handlers: Array.from(interactionHandlers.keys()).sort(),
    };
}
