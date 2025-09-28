import {
    EmbedBuilder,
    ColorResolvable,
    User,
    APIEmbedField,
    APIEmbedFooter,
    APIEmbedAuthor,
} from "discord.js";

/**
 * Comprehensive Embed Utility for Yukami Bot
 *
 * Provides consistent styling and easy-to-use methods for all types of
 * messages, errors, and responses throughout the application.
 */

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

export const EMBED_COLORS = {
    // Primary Colors
    PRIMARY: "#5865F2" as ColorResolvable, // Discord Blurple
    SECONDARY: "#57F287" as ColorResolvable, // Discord Green
    ACCENT: "#FEE75C" as ColorResolvable, // Discord Yellow

    // Status Colors
    SUCCESS: "#57F287" as ColorResolvable, // Green
    WARNING: "#FEE75C" as ColorResolvable, // Yellow
    ERROR: "#ED4245" as ColorResolvable, // Red
    INFO: "#5865F2" as ColorResolvable, // Blue

    // Role-Playing Colors
    ADVENTURE: "#9C59B6" as ColorResolvable, // Purple
    AVATAR: "#3498DB" as ColorResolvable, // Light Blue
    LEVEL_UP: "#F39C12" as ColorResolvable, // Orange
    QUEST: "#E67E22" as ColorResolvable, // Dark Orange

    // System Colors
    NEUTRAL: "#95A5A6" as ColorResolvable, // Gray
    DARK: "#2C3E50" as ColorResolvable, // Dark Gray
} as const;

export const EMBED_EMOJIS = {
    SUCCESS: "✅",
    ERROR: "❌",
    WARNING: "⚠️",
    INFO: "ℹ️",
    LOADING: "⏳",
    AVATAR: "👤",
    LEVEL_UP: "⭐",
    QUEST: "📜",
    TRAVEL: "🗺️",
    REACTION_ROLE: "🎭",
    WELCOME: "👋",
    PING: "🏓",
    SETTINGS: "⚙️",
    STATS: "📊",
    XP: "💎",
    COINS: "🪙",
} as const;

// ============================================================================
// BASE EMBED CLASS
// ============================================================================

export class YukamiEmbed extends EmbedBuilder {
    constructor() {
        super();
        this.setColor(EMBED_COLORS.PRIMARY);
        this.setTimestamp();
    }

    /**
     * Set author with user information
     */
    setUserAuthor(user: User, text?: string): this {
        return this.setAuthor({
            name: text || user.displayName,
            iconURL: user.displayAvatarURL({ extension: "png", size: 64 }),
        });
    }

    /**
     * Set bot footer with Yukami branding
     */
    setBotFooter(text?: string): this {
        return this.setFooter({
            text: text || "Yukami Bot • Role-playing made simple",
            iconURL: "https://i.imgur.com/placeholder-bot-icon.png", // Replace with actual bot icon
        });
    }

    /**
     * Add a field with consistent formatting
     */
    addFormattedField(
        name: string,
        value: string,
        inline: boolean = false
    ): this {
        return this.addFields({
            name: `**${name}**`,
            value: value || "\u200B", // Zero-width space if empty
            inline,
        });
    }

    /**
     * Set success styling
     */
    asSuccess(): this {
        return this.setColor(EMBED_COLORS.SUCCESS);
    }

    /**
     * Set error styling
     */
    asError(): this {
        return this.setColor(EMBED_COLORS.ERROR);
    }

    /**
     * Set warning styling
     */
    asWarning(): this {
        return this.setColor(EMBED_COLORS.WARNING);
    }

    /**
     * Set info styling
     */
    asInfo(): this {
        return this.setColor(EMBED_COLORS.INFO);
    }

    /**
     * Set avatar/character styling
     */
    asAvatar(): this {
        return this.setColor(EMBED_COLORS.AVATAR);
    }

    /**
     * Set quest styling
     */
    asQuest(): this {
        return this.setColor(EMBED_COLORS.QUEST);
    }

    /**
     * Set level up styling
     */
    asLevelUp(): this {
        return this.setColor(EMBED_COLORS.LEVEL_UP);
    }
}

// ============================================================================
// QUICK EMBED BUILDERS
// ============================================================================

/**
 * Success message embed
 */
export function createSuccessEmbed(
    title: string,
    description?: string
): YukamiEmbed {
    return new YukamiEmbed()
        .asSuccess()
        .setTitle(`${EMBED_EMOJIS.SUCCESS} ${title}`)
        .setDescription(description || null)
        .setBotFooter();
}

/**
 * Error message embed
 */
export function createErrorEmbed(
    title: string,
    description?: string,
    details?: string
): YukamiEmbed {
    const embed = new YukamiEmbed()
        .asError()
        .setTitle(`${EMBED_EMOJIS.ERROR} ${title}`)
        .setDescription(description || "An unexpected error occurred.")
        .setBotFooter("If this persists, please contact support");

    if (details) {
        embed.addFormattedField("Details", `\`\`\`${details}\`\`\``);
    }

    return embed;
}

/**
 * Warning message embed
 */
export function createWarningEmbed(
    title: string,
    description?: string
): YukamiEmbed {
    return new YukamiEmbed()
        .asWarning()
        .setTitle(`${EMBED_EMOJIS.WARNING} ${title}`)
        .setDescription(description || null)
        .setBotFooter();
}

/**
 * Info message embed
 */
export function createInfoEmbed(
    title: string,
    description?: string
): YukamiEmbed {
    return new YukamiEmbed()
        .asInfo()
        .setTitle(`${EMBED_EMOJIS.INFO} ${title}`)
        .setDescription(description || null)
        .setBotFooter();
}

/**
 * Loading message embed
 */
export function createLoadingEmbed(action: string = "Processing"): YukamiEmbed {
    return new YukamiEmbed()
        .asInfo()
        .setTitle(`${EMBED_EMOJIS.LOADING} ${action}...`)
        .setDescription("Please wait while I process your request.")
        .setBotFooter();
}

// ============================================================================
// SPECIALIZED EMBEDS
// ============================================================================

/**
 * Avatar display embed
 */
export function createAvatarEmbed(avatar: any, user: User): YukamiEmbed {
    const embed = new YukamiEmbed()
        .asAvatar()
        .setTitle(`${EMBED_EMOJIS.AVATAR} ${avatar.name}`)
        .setUserAuthor(user, `${user.displayName}'s Avatar`)
        .setThumbnail(avatar.icon)
        .addFormattedField("Species", avatar.species, true)
        .addFormattedField("Level", avatar.level.toString(), true)
        .addFormattedField("Bracket", `\`${avatar.bracket}\``, true)
        .setBotFooter();

    return embed;
}

/**
 * Level up embed
 */
export function createLevelUpEmbed(
    user: User,
    oldLevel: number,
    newLevel: number,
    xp: number
): YukamiEmbed {
    return new YukamiEmbed()
        .asLevelUp()
        .setTitle(`${EMBED_EMOJIS.LEVEL_UP} Level Up!`)
        .setUserAuthor(user)
        .setDescription(
            `Congratulations! You've reached level **${newLevel}**!`
        )
        .addFormattedField("Previous Level", oldLevel.toString(), true)
        .addFormattedField("New Level", newLevel.toString(), true)
        .addFormattedField(
            "Total XP",
            `${EMBED_EMOJIS.XP} ${xp.toLocaleString()}`,
            true
        )
        .setBotFooter();
}

/**
 * Quest embed
 */
export function createQuestEmbed(
    quest: any,
    status: "available" | "active" | "completed" = "available"
): YukamiEmbed {
    const embed = new YukamiEmbed()
        .asQuest()
        .setTitle(`${EMBED_EMOJIS.QUEST} ${quest.name}`)
        .setDescription(quest.description);

    // Status-specific styling
    switch (status) {
        case "active":
            embed.addFormattedField("Status", "🔄 **In Progress**", true);
            break;
        case "completed":
            embed.addFormattedField("Status", "✅ **Completed**", true);
            break;
        default:
            embed.addFormattedField("Status", "📋 **Available**", true);
    }

    if (quest.rewardXp > 0) {
        embed.addFormattedField(
            "XP Reward",
            `${EMBED_EMOJIS.XP} ${quest.rewardXp}`,
            true
        );
    }

    if (quest.rewardItems && quest.rewardItems.length > 0) {
        embed.addFormattedField(
            "Item Rewards",
            quest.rewardItems.join(", "),
            true
        );
    }

    return embed.setBotFooter();
}

/**
 * Welcome embed
 */
export function createWelcomeEmbed(
    user: User,
    guildName: string,
    customMessage?: string
): YukamiEmbed {
    const embed = new YukamiEmbed()
        .asSuccess()
        .setTitle(`${EMBED_EMOJIS.WELCOME} Welcome to ${guildName}!`)
        .setUserAuthor(user, `Welcome ${user.displayName}!`)
        .setThumbnail(user.displayAvatarURL({ extension: "png", size: 256 }))
        .setBotFooter();

    if (customMessage) {
        embed.setDescription(customMessage.replace("{user}", user.toString()));
    } else {
        embed.setDescription(
            `Welcome ${user.toString()}! We're glad to have you here.`
        );
    }

    return embed;
}

/**
 * Ping/Latency embed
 */
export function createPingEmbed(
    latency: number,
    apiLatency: number
): YukamiEmbed {
    const embed = new YukamiEmbed()
        .asInfo()
        .setTitle(`${EMBED_EMOJIS.PING} Pong!`)
        .addFormattedField("Bot Latency", `${latency}ms`, true)
        .addFormattedField("API Latency", `${apiLatency}ms`, true)
        .setBotFooter();

    // Color code based on latency
    if (latency < 100) {
        embed.asSuccess();
    } else if (latency < 300) {
        embed.asWarning();
    } else {
        embed.asError();
    }

    return embed;
}

/**
 * Help/Command embed
 */
export function createHelpEmbed(
    commandName: string,
    description: string,
    usage?: string,
    examples?: string[]
): YukamiEmbed {
    const embed = new YukamiEmbed()
        .asInfo()
        .setTitle(`${EMBED_EMOJIS.INFO} /${commandName}`)
        .setDescription(description);

    if (usage) {
        embed.addFormattedField("Usage", `\`/${usage}\``);
    }

    if (examples && examples.length > 0) {
        embed.addFormattedField(
            "Examples",
            examples.map((ex) => `\`/${ex}\``).join("\n")
        );
    }

    return embed.setBotFooter();
}

// ============================================================================
// ERROR SPECIFIC EMBEDS
// ============================================================================

/**
 * Command not found embed
 */
export function createCommandNotFoundEmbed(commandName: string): YukamiEmbed {
    return createErrorEmbed(
        "Command Not Found",
        `The command \`/${commandName}\` is not available.`,
        "Use `/help` to see available commands"
    );
}

/**
 * Permission denied embed
 */
export function createPermissionDeniedEmbed(
    requiredPermission?: string
): YukamiEmbed {
    const description = requiredPermission
        ? `You need the **${requiredPermission}** permission to use this command.`
        : "You don't have permission to use this command.";

    return createErrorEmbed("Permission Denied", description);
}

/**
 * Cooldown embed
 */
export function createCooldownEmbed(timeLeft: number): YukamiEmbed {
    const timeString =
        timeLeft > 60
            ? `${Math.ceil(timeLeft / 60)} minute(s)`
            : `${timeLeft} second(s)`;

    return createErrorEmbed(
        "Command Cooldown",
        `Please wait **${timeString}** before using this command again.`
    );
}

/**
 * Maintenance embed
 */
export function createMaintenanceEmbed(): YukamiEmbed {
    return createWarningEmbed(
        "Under Maintenance",
        "This feature is temporarily unavailable due to maintenance. Please try again later."
    );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Truncate text to fit embed limits
 */
export function truncateText(text: string, maxLength: number = 2048): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
}

/**
 * Format user mention for embeds
 */
export function formatUserMention(userId: string): string {
    return `<@${userId}>`;
}

/**
 * Format channel mention for embeds
 */
export function formatChannelMention(channelId: string): string {
    return `<#${channelId}>`;
}

/**
 * Format role mention for embeds
 */
export function formatRoleMention(roleId: string): string {
    return `<@&${roleId}>`;
}

/**
 * Format timestamp for embeds
 */
export function formatTimestamp(
    date: Date,
    style: "R" | "T" | "t" | "D" | "d" | "F" | "f" = "R"
): string {
    return `<t:${Math.floor(date.getTime() / 1000)}:${style}>`;
}

/**
 * Create a progress bar for embeds
 */
export function createProgressBar(
    current: number,
    max: number,
    length: number = 10
): string {
    const percentage = Math.min(current / max, 1);
    const filled = Math.round(percentage * length);
    const empty = length - filled;

    const filledBar = "█".repeat(filled);
    const emptyBar = "░".repeat(empty);
    const percentText = Math.round(percentage * 100);

    return `${filledBar}${emptyBar} ${percentText}%`;
}

/**
 * Create XP progress bar with level information
 */
export function createXPProgressBar(
    currentXP: number,
    levelXP: number,
    nextLevelXP: number
): string {
    const xpInLevel = currentXP - levelXP;
    const xpNeeded = nextLevelXP - levelXP;
    return createProgressBar(xpInLevel, xpNeeded, 15);
}

// ============================================================================
// REACTION ROLE EMBEDS
// ============================================================================

/**
 * Reaction role setup embed
 */
export function createReactionRoleEmbed(
    title: string,
    description: string,
    roles: Array<{ emoji: string; role: string; description?: string }>
): YukamiEmbed {
    const embed = new YukamiEmbed()
        .asInfo()
        .setTitle(`${EMBED_EMOJIS.REACTION_ROLE} ${title}`)
        .setDescription(description)
        .setBotFooter();

    if (roles.length > 0) {
        const roleList = roles
            .map(
                (r) =>
                    `${r.emoji} - **${r.role}**${
                        r.description ? ` - ${r.description}` : ""
                    }`
            )
            .join("\n");

        embed.addFormattedField("Available Roles", roleList);
    }

    return embed;
}

// ============================================================================
// STATS AND LEADERBOARD EMBEDS
// ============================================================================

/**
 * User stats embed
 */
export function createUserStatsEmbed(user: User, stats: any): YukamiEmbed {
    const embed = new YukamiEmbed()
        .asInfo()
        .setTitle(`${EMBED_EMOJIS.STATS} ${user.displayName}'s Stats`)
        .setUserAuthor(user)
        .setThumbnail(user.displayAvatarURL({ extension: "png", size: 128 }))
        .setBotFooter();

    // Level and XP
    if (stats.level !== undefined) {
        embed.addFormattedField(
            "Level",
            `${EMBED_EMOJIS.LEVEL_UP} ${stats.level}`,
            true
        );
    }

    if (stats.xp !== undefined) {
        embed.addFormattedField(
            "Total XP",
            `${EMBED_EMOJIS.XP} ${stats.xp.toLocaleString()}`,
            true
        );
    }

    // Progress bar for current level
    if (stats.currentXP && stats.nextLevelXP) {
        const progressBar = createXPProgressBar(
            stats.currentXP,
            stats.levelXP || 0,
            stats.nextLevelXP
        );
        embed.addFormattedField("Progress to Next Level", progressBar);
    }

    // Additional stats
    if (stats.messagesCount) {
        embed.addFormattedField(
            "Messages Sent",
            stats.messagesCount.toLocaleString(),
            true
        );
    }

    if (stats.avatarsCount) {
        embed.addFormattedField(
            "Avatars Created",
            `${EMBED_EMOJIS.AVATAR} ${stats.avatarsCount}`,
            true
        );
    }

    return embed;
}

// ============================================================================
// INTEGRATION EXAMPLES
// ============================================================================

/**
 * Example integration for existing interaction handlers
 */
export class EmbedIntegrationExamples {
    /**
     * Update existing avatar command (interactions/avatar.ts)
     */
    static avatarCommandResponse(avatar: any, user: User): YukamiEmbed {
        return createAvatarEmbed(avatar, user)
            .setDescription(`**${avatar.name}** is ready for adventure!`)
            .addFormattedField(
                "Current Location",
                avatar.location || "Unknown",
                true
            );
    }

    /**
     * Update existing ping command (interactions/ping.ts)
     */
    static pingCommandResponse(
        botLatency: number,
        apiLatency: number
    ): YukamiEmbed {
        return createPingEmbed(botLatency, apiLatency).addFormattedField(
            "Status",
            "🟢 Online",
            true
        );
    }

    /**
     * Update existing welcome message (interactions/welcome.ts)
     */
    static welcomeMessage(
        user: User,
        guild: any,
        customMessage?: string
    ): YukamiEmbed {
        return createWelcomeEmbed(user, guild.name, customMessage)
            .addFormattedField(
                "Member Count",
                `${guild.memberCount} members`,
                true
            )
            .addFormattedField(
                "Account Created",
                formatTimestamp(user.createdAt, "D"),
                true
            );
    }

    /**
     * Enhanced error handling for all interactions
     */
    static handleInteractionError(
        error: Error,
        commandName: string
    ): YukamiEmbed {
        console.error(`Error in ${commandName}:`, error);

        if (error.message.includes("permission")) {
            return createPermissionDeniedEmbed();
        }

        if (error.message.includes("cooldown")) {
            return createCooldownEmbed(30); // Default 30 seconds
        }

        return createErrorEmbed(
            "Command Failed",
            "Something went wrong while executing this command.",
            process.env.NODE_ENV === "production" ? undefined : error.message
        );
    }
}

// ============================================================================
// VALIDATION AND SAFETY
// ============================================================================

/**
 * Validate embed before sending
 */
export function validateEmbed(embed: EmbedBuilder): boolean {
    const data = embed.toJSON();

    // Check title length
    if (data.title && data.title.length > 256) {
        console.warn("Embed title too long:", data.title.length);
        return false;
    }

    // Check description length
    if (data.description && data.description.length > 4096) {
        console.warn("Embed description too long:", data.description.length);
        return false;
    }

    // Check field count
    if (data.fields && data.fields.length > 25) {
        console.warn("Too many embed fields:", data.fields.length);
        return false;
    }

    // Check field lengths
    if (data.fields) {
        for (const field of data.fields) {
            if (field.name.length > 256) {
                console.warn("Field name too long:", field.name.length);
                return false;
            }
            if (field.value.length > 1024) {
                console.warn("Field value too long:", field.value.length);
                return false;
            }
        }
    }

    return true;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    YukamiEmbed,
    EMBED_COLORS,
    EMBED_EMOJIS,

    // Quick builders
    createSuccessEmbed,
    createErrorEmbed,
    createWarningEmbed,
    createInfoEmbed,
    createLoadingEmbed,

    // Specialized embeds
    createAvatarEmbed,
    createLevelUpEmbed,
    createQuestEmbed,
    createWelcomeEmbed,
    createPingEmbed,
    createHelpEmbed,
    createReactionRoleEmbed,
    createUserStatsEmbed,

    // Error embeds
    createCommandNotFoundEmbed,
    createPermissionDeniedEmbed,
    createCooldownEmbed,
    createMaintenanceEmbed,

    // Utilities
    truncateText,
    formatUserMention,
    formatChannelMention,
    formatRoleMention,
    formatTimestamp,
    createProgressBar,
    createXPProgressBar,
    validateEmbed,

    // Integration examples
    EmbedIntegrationExamples,
};
