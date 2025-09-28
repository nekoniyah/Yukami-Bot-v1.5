import { Client, Partials, GatewayIntentBits } from "discord.js";
import fs from "fs/promises"; // Use async version
import path from "path";
import "dotenv/config";

/**
 * Yukami Bot v1.5 - Main Entry Point
 *
 * A Discord bot featuring avatar roleplay system, reaction roles,
 * leveling mechanics, and welcome messages.
 *
 * @version 1.5.0
 * @author nekoniyah
 */

// Environment validation
if (!process.env.TOKEN) {
    console.error("❌ Missing required environment variable: TOKEN");
    process.exit(1);
}

/**
 * Discord client configuration with optimized intents
 * Only requesting the permissions we actually need
 */
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.GuildMember,
        Partials.User,
    ],
    // Performance optimizations
    failIfNotExists: false,
    allowedMentions: {
        parse: ["users", "roles"],
        repliedUser: true,
    },
});

/**
 * Event loader with proper error handling and logging
 */
async function loadEvents(): Promise<void> {
    const eventPath = path.join(__dirname, "events");

    try {
        const eventFiles = await fs.readdir(eventPath);
        const tsFiles = eventFiles.filter((file) => file.endsWith(".ts"));

        console.log(`📂 Loading ${tsFiles.length} event handlers...`);

        for (const file of tsFiles) {
            const eventName = file.replace(".ts", "");

            try {
                const { default: eventHandler } = await import(
                    path.join(eventPath, file)
                );

                client.on(eventName, async (...args) => {
                    try {
                        await eventHandler(...args);
                    } catch (error) {
                        console.error(`❌ Error in ${eventName} event:`, error);
                    }
                });

                console.log(`✅ Loaded event: ${eventName}`);
            } catch (error) {
                console.error(`❌ Failed to load event ${eventName}:`, error);
            }
        }

        console.log(`🎉 Successfully loaded ${tsFiles.length} events`);
    } catch (error) {
        console.error("❌ Failed to read events directory:", error);
        process.exit(1);
    }
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(): Promise<void> {
    console.log("🔄 Shutting down gracefully...");

    try {
        client.destroy();
        console.log("✅ Client destroyed");
    } catch (error) {
        console.error("❌ Error during shutdown:", error);
    }

    process.exit(0);
}

// Process event handlers
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
process.on("unhandledRejection", (reason, promise) => {
    console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
});

/**
 * Initialize and start the bot
 */
async function main(): Promise<void> {
    try {
        // Initialize database first
        await import("./utils/db");
        console.log("✅ Database initialized");

        // Load event handlers
        await loadEvents();

        // Connect to Discord
        await client.login(process.env.TOKEN);
        console.log("🚀 Bot connected to Discord successfully!");
    } catch (error) {
        console.error("❌ Failed to start bot:", error);
        process.exit(1);
    }
}

// Start the application
main();
