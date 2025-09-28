import { TextChannel, Message, Webhook } from "discord.js";
import { Avatar } from "../utils/models";
import eventBuilder from "../utils/eventBuilder";

/**
 * Message Create Event Handler
 *
 * Handles incoming messages and processes avatar bracket matching.
 * When a user sends a message with avatar brackets, it replaces the message
 * with a webhook message using the avatar's appearance.
 */

/**
 * Webhook manager for handling avatar messages
 * Manages webhook creation and message sending for avatar roleplay
 */
class WebhookManager {
    private webhook: Webhook | null = null;
    private readonly channel: TextChannel;

    constructor(channel: TextChannel) {
        this.channel = channel;
    }

    /**
     * Get or create a webhook for this channel
     * @returns The webhook instance
     */
    async getWebhook(): Promise<Webhook> {
        if (this.webhook) return this.webhook;

        const webhooks = await this.channel.fetchWebhooks();
        this.webhook =
            webhooks.find(
                (wh) => wh.owner?.id === this.channel.client.user.id
            ) || null;

        if (!this.webhook) {
            this.webhook = await this.createWebhook();
        }

        return this.webhook;
    }

    /**
     * Send a message as an avatar using webhook
     * @param params Message parameters
     */
    async sendAsAvatar(params: {
        content: string;
        avatar: string;
        name: string;
    }): Promise<void> {
        try {
            const webhook = await this.getWebhook();
            await webhook.send({
                content: params.content,
                avatarURL: params.avatar,
                username: params.name,
            });
        } catch (error) {
            console.error("Failed to send webhook message:", error);
            // Fallback: send as regular bot message
            await this.channel.send(`**${params.name}**: ${params.content}`);
        }
    }

    /**
     * Create a new webhook for the channel
     * @returns The created webhook
     */
    private async createWebhook(): Promise<Webhook> {
        return await this.channel.createWebhook({
            name: `${this.channel.client.user.username} Avatar System`,
            avatar: this.channel.client.user.displayAvatarURL(),
        });
    }
}

/**
 * Cache for user avatars to reduce database queries
 * Maps userId to their avatars with TTL
 */
class AvatarCache {
    private cache = new Map<string, { avatars: Avatar[]; expires: number }>();
    private readonly TTL = 5 * 60 * 1000; // 5 minutes

    /**
     * Get user avatars from cache or database
     * @param userId Discord user ID
     * @returns Array of user avatars
     */
    async getUserAvatars(userId: string): Promise<Avatar[]> {
        const cached = this.cache.get(userId);

        // Return cached data if still valid
        if (cached && cached.expires > Date.now()) {
            return cached.avatars;
        }

        // Fetch from database
        const avatars = await Avatar.findAll({
            where: { userId },
        });

        // Cache the result
        this.cache.set(userId, {
            avatars,
            expires: Date.now() + this.TTL,
        });

        return avatars;
    }

    /**
     * Clear cache for a specific user
     * @param userId Discord user ID
     */
    invalidateUser(userId: string): void {
        this.cache.delete(userId);
    }

    /**
     * Clear expired entries from cache
     */
    cleanup(): void {
        const now = Date.now();
        for (const [userId, data] of this.cache.entries()) {
            if (data.expires <= now) {
                this.cache.delete(userId);
            }
        }
    }
}

// Global avatar cache instance
const avatarCache = new AvatarCache();

// Clean up cache every 10 minutes
setInterval(() => avatarCache.cleanup(), 10 * 60 * 1000);

/**
 * Parse avatar bracket and extract content
 * @param bracket Bracket pattern with 'text' placeholder
 * @param content Message content to test
 * @returns Extracted content or null if no match
 */
function parseBracketContent(bracket: string, content: string): string | null {
    const parts = bracket.split("text");
    if (parts.length !== 2) {
        console.warn(`Invalid bracket format: ${bracket}`);
        return null;
    }

    const [prefix, suffix] = parts;

    // Check if message matches the bracket pattern
    if (prefix && !content.startsWith(prefix)) return null;
    if (suffix && !content.endsWith(suffix)) return null;

    // Extract the content between brackets
    let extracted = content;
    if (prefix) extracted = extracted.slice(prefix.length);
    if (suffix) extracted = extracted.slice(0, -suffix.length);

    return extracted.trim();
}

export default eventBuilder<"messageCreate">(async (message: Message) => {
    // Skip bot messages and DMs
    if (message.author.bot || message.channel.isDMBased()) return;

    // Ensure we're in a text channel
    const channel = message.channel as TextChannel;
    if (!channel.isTextBased()) return;

    try {
        // Get user's avatars from cache
        const avatars = await avatarCache.getUserAvatars(message.author.id);

        // Skip if user has no avatars
        if (avatars.length === 0) return;

        // Initialize webhook manager
        const webhookManager = new WebhookManager(channel);

        // Check each avatar for bracket matches
        for (const avatar of avatars) {
            const bracket = avatar.get("bracket") as string;
            const extractedContent = parseBracketContent(
                bracket,
                message.content
            );

            if (extractedContent !== null) {
                // Delete the original message
                try {
                    await message.delete();
                } catch (error) {
                    console.warn("Failed to delete message:", error);
                    // Continue anyway - the webhook message will still be sent
                }

                // Send as avatar
                await webhookManager.sendAsAvatar({
                    content: extractedContent,
                    avatar: avatar.get("icon") as string,
                    name: avatar.get("name") as string,
                });

                // Only process the first matching avatar
                break;
            }
        }
    } catch (error) {
        console.error("Error in messageCreate event:", error);
        // Don't throw - this would crash the bot
    }
});
