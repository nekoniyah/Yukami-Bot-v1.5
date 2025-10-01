// events/clientReady.ts - Enhanced version with comprehensive folder support
import { REST, Routes } from "discord.js";
import eventBuilder from "../utils/eventBuilder";
import "dotenv/config";
import fs from "fs/promises";
import path from "path";

/**
 * Enhanced Client Ready Event Handler
 *
 * Features:
 * - Recursive folder support for registers directory
 * - Enhanced error handling and logging
 * - Performance monitoring
 * - Detailed registration verification
 * - Bot status reporting
 */

/**
 * Recursively load command files from any depth in registers directory
 */
async function loadCommandsRecursively(
    dirPath: string,
    basePath?: string
): Promise<any[]> {
    const commands: any[] = [];
    const currentBasePath = basePath || dirPath;

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
                    console.log(
                        `📁 Scanning directory: ${path.relative(
                            currentBasePath,
                            fullPath
                        )}`
                    );
                    const subCommands = await loadCommandsRecursively(
                        fullPath,
                        currentBasePath
                    );
                    commands.push(...subCommands);
                }
            } else if (entry.name.endsWith(".ts")) {
                try {
                    const { default: commandBuilder } = await import(fullPath);

                    if (!commandBuilder) {
                        console.warn(
                            `⚠️ No default export in ${path.relative(
                                currentBasePath,
                                fullPath
                            )}`
                        );
                        continue;
                    }

                    if (typeof commandBuilder.toJSON !== "function") {
                        console.warn(
                            `⚠️ Invalid command builder (missing toJSON) in ${path.relative(
                                currentBasePath,
                                fullPath
                            )}`
                        );
                        continue;
                    }

                    const commandData = commandBuilder.toJSON();
                    commands.push(commandData);

                    const relativePath = path.relative(
                        currentBasePath,
                        fullPath
                    );
                    console.log(
                        `✅ Loaded command: ${commandData.name} (${relativePath})`
                    );

                    // Validate command structure
                    if (!commandData.name || !commandData.description) {
                        console.warn(
                            `⚠️ Command missing name or description: ${relativePath}`
                        );
                    }
                } catch (error) {
                    const relativePath = path.relative(
                        currentBasePath,
                        fullPath
                    );
                    console.error(
                        `❌ Failed to load command from ${relativePath}:`,
                        error
                    );
                }
            }
        }
    } catch (error) {
        console.error(`❌ Failed to read directory ${dirPath}:`, error);
    }

    return commands;
}

/**
 * Register commands with Discord API with enhanced error handling
 */
async function registerCommands(client: any, commands: any[]): Promise<void> {
    if (commands.length === 0) {
        console.warn("⚠️ No commands found to register");
        return;
    }

    const rest = new REST().setToken(process.env.TOKEN!);

    console.log(
        `📝 Preparing to register ${commands.length} slash commands...`
    );

    try {
        console.log("🔄 Registering slash commands with Discord API...");

        const registeredCommands = (await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        )) as any[];

        console.log("\n✅ Command Registration Results:");

        // Track registration success/failure
        let successCount = 0;
        let failCount = 0;

        for (const cmd of commands) {
            const registered = registeredCommands.find(
                (c: any) => c.name === cmd.name
            );
            if (registered) {
                console.log(
                    `  ✅ ${cmd.name.padEnd(20)} (ID: ${registered.id})`
                );
                successCount++;
            } else {
                console.error(
                    `  ❌ ${cmd.name.padEnd(20)} - Failed to register`
                );
                failCount++;
            }
        }

        console.log(
            `\n🎉 Registration Summary: ${successCount} successful, ${failCount} failed`
        );

        if (failCount > 0) {
            console.warn(
                `⚠️ ${failCount} commands failed to register. Check command validity and Discord API limits.`
            );
        }

        // Log command details in development
        if (process.env.NODE_ENV === "development") {
            console.log("\n📋 Registered Command Details:");
            for (const cmd of registeredCommands) {
                console.log(`  • ${cmd.name}: ${cmd.description}`);
            }
        }
    } catch (error: any) {
        console.error(
            "❌ Failed to register commands with Discord API:",
            error
        );

        // Provide more specific error information
        if (error.code === 50035) {
            console.error(
                "💡 This is likely due to invalid command data. Check command builders for proper structure."
            );
        } else if (error.code === 429) {
            console.error(
                "💡 Rate limited. Try again later or reduce the number of commands being registered."
            );
        } else if (error.status === 401) {
            console.error(
                "💡 Invalid bot token. Check your TOKEN environment variable."
            );
        }

        throw error;
    }
}

/**
 * Log comprehensive bot status information
 */
function logBotStatus(client: any, commandCount: number): void {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    console.log("\n🤖 Bot Status Report:");
    console.log("==========================================");
    console.log(
        `Bot Name: ${client.user.username}#${client.user.discriminator}`
    );
    console.log(`Bot ID: ${client.user.id}`);
    console.log(`Commands Registered: ${commandCount}`);
    console.log(`Guilds: ${client.guilds.cache.size}`);
    console.log(`Users: ${client.users.cache.size}`);
    console.log(`Channels: ${client.channels.cache.size}`);
    console.log(
        `Uptime: ${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`
    );
    console.log(
        `Memory Usage: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`
    );
    console.log(`Node Version: ${process.version}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log("==========================================");

    // Set bot activity/presence
    try {
        client.user.setActivity(
            `with avatars | /avatar | ${client.guilds.cache.size} servers`,
            {
                type: 0, // Playing
            }
        );
        console.log("✅ Bot activity set successfully");
    } catch (error) {
        console.error("❌ Failed to set bot activity:", error);
    }
}

/**
 * Validate environment and configuration
 */
function validateEnvironment(): void {
    const requiredEnvVars = ["TOKEN"];
    const missingVars = requiredEnvVars.filter(
        (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
        console.error(
            `❌ Missing required environment variables: ${missingVars.join(
                ", "
            )}`
        );
        process.exit(1);
    }

    // Validate optional environment variables
    const optionalEnvVars = {
        DATABASE_URL: "./db/database.db",
        CACHE_TTL: "300000",
        MAX_AVATARS_PER_USER: "10",
        NODE_ENV: "development",
    };

    for (const [varName, defaultValue] of Object.entries(optionalEnvVars)) {
        if (!process.env[varName]) {
            console.log(
                `💡 Using default value for ${varName}: ${defaultValue}`
            );
        }
    }
}

export default eventBuilder<"clientReady">(async (client) => {
    const startTime = Date.now();

    console.log(`🚀 ${client.user.username} is ready!`);
    console.log(
        `📊 Connected to ${client.guilds.cache.size} guilds with ${client.users.cache.size} users`
    );

    try {
        // Validate environment
        validateEnvironment();

        // Load commands from registers directory with folder support
        console.log("\n⚡ Loading slash commands from registers directory...");
        const registerFolder = path.join(__dirname, "..", "registers");

        // Check if registers directory exists
        try {
            await fs.access(registerFolder);
        } catch (error) {
            console.error(
                `❌ Registers directory not found: ${registerFolder}`
            );
            return;
        }

        const commands = await loadCommandsRecursively(registerFolder);

        if (commands.length === 0) {
            console.warn("⚠️ No valid commands found in registers directory");
            return;
        }

        // Register commands with Discord
        await registerCommands(client, commands);

        // Log comprehensive bot status
        logBotStatus(client, commands.length);

        const initTime = Date.now() - startTime;
        console.log(`\n🎊 Bot initialization completed in ${initTime}ms`);
        console.log(`🎮 ${process.env.NAME} is now fully operational!`);
    } catch (error) {
        console.error("❌ Error during bot initialization:", error);

        // Don't crash the bot, but log the error
        console.log(
            "🔄 Bot will continue running but some features may be unavailable"
        );
    }
});
