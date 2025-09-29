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
    ],
    failIfNotExists: false,
    allowedMentions: {
        parse: ["users", "roles"],
        repliedUser: true,
    },
});

/**
 * Recursively load TypeScript files from directories
 */
async function loadFilesRecursively(dirPath: string): Promise<string[]> {
    const files: string[] = [];

    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                // Skip hidden directories, node_modules, and build directories
                if (
                    !entry.name.startsWith(".") &&
                    entry.name !== "node_modules" &&
                    entry.name !== "dist" &&
                    entry.name !== "build"
                ) {
                    const subFiles = await loadFilesRecursively(fullPath);
                    files.push(...subFiles);
                }
            } else if (entry.isFile() && entry.name.endsWith(".ts")) {
                files.push(fullPath);
            }
        }
    } catch (error) {
        console.error(`❌ Failed to read directory ${dirPath}:`, error);
    }

    return files;
}

/**
 * Enhanced event loader with folder support and error handling
 */
async function loadEvents(): Promise<void> {
    const eventPath = path.join(__dirname, "events");

    try {
        const eventFiles = await loadFilesRecursively(eventPath);

        if (eventFiles.length === 0) {
            console.warn("⚠️ No event files found");
            return;
        }

        console.log(`📂 Loading ${eventFiles.length} event handlers...`);

        let loadedCount = 0;
        for (const filePath of eventFiles) {
            const eventName = path.basename(filePath, ".ts");

            try {
                const { default: eventHandler } = await import(filePath);

                if (!eventHandler) {
                    console.warn(`⚠️ No default export in ${eventName}`);
                    continue;
                }

                // Wrap event handler with error handling
                client.on(eventName, async (...args) => {
                    try {
                        await eventHandler(...args);
                    } catch (error) {
                        console.error(`❌ Error in ${eventName} event:`, error);
                    }
                });

                const relativePath = path.relative(eventPath, filePath);
                console.log(`✅ Loaded event: ${eventName} (${relativePath})`);
                loadedCount++;
            } catch (error) {
                console.error(`❌ Failed to load event ${eventName}:`, error);
            }
        }

        console.log(
            `🎉 Successfully loaded ${loadedCount}/${eventFiles.length} events`
        );
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
