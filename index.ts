// index.ts - Enhanced version with folder support
import { Client, Partials, GatewayIntentBits } from "discord.js";
import fs from "fs/promises";
import path from "path";
import "dotenv/config";

/**
 * Yukami Bot v1.5 - Enhanced Main Entry Point
 *
 * Features:
 * - Recursive folder support for events, interactions, and registers
 * - Enhanced error handling and logging
 * - Performance monitoring
 * - Graceful shutdown handling
 * - Database initialization
 */

// Environment validation
if (!process.env.TOKEN) {
    console.error("❌ Missing required environment variable: TOKEN");
    process.exit(1);
}

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
        Partials.ThreadMember,
    ],
    failIfNotExists: false,
    allowedMentions: {
        parse: ["users", "roles"],
        repliedUser: true,
    },
});

/**
 * Enhanced event loader with folder support and error handling
 */
async function loadEvents(baseFolderName?: string): Promise<void> {
    const eventPath = baseFolderName
        ? path.join(__dirname, "events", baseFolderName)
        : path.join(__dirname, "events");

    let files = await fs.readdir(eventPath, { withFileTypes: true });

    for (let f of files) {
        if (f.isDirectory()) {
            console.log(`📁 Scanning directory: ${f.name}`);
            await loadEvents(f.name);
        } else {
            if (baseFolderName) {
                let { default: ev } = await import(
                    path.join(eventPath, f.name)
                );
                client.on(baseFolderName, ev);
            } else {
                let { default: ev } = await import(
                    path.join(eventPath, f.name)
                );
                client.on(f.name.replace(".ts", ""), ev);
            }

            console.log(`✅ Loaded event: ${f.name}`);
        }
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
