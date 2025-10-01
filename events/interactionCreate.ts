// events/interactionCreate.ts - Enhanced version with folder support
import eventBuilder from "../utils/eventBuilder";
import {
    Interaction,
    InteractionEditReplyOptions,
    InteractionType,
} from "discord.js";
import {} from "../interactions/buttons/create_avatar";
import { createErrorEmbed } from "../utils/embeds";
import path from "path";
import { readdirSync } from "fs";
import { Avatar } from "../utils/models";
export type Handler<T extends Interaction = Interaction> = (
    interaction: T,
    avatars: Avatar[],
    callback: (options: InteractionEditReplyOptions) => void
) => Promise<void>;
type YukamiInteractionType = "button" | "select" | "modal" | "slash";

export async function loadAllInteractionFiles() {
    const folderPath = path.join(process.cwd(), "interactions");
    const filesAndSubfolders = readdirSync(folderPath, { withFileTypes: true });
    const map = new Map<
        string,
        {
            handler: Handler;
            for: YukamiInteractionType;
        }
    >();

    for (let f of filesAndSubfolders) {
        // Directory names in the interactions folder are in plural, so we need to remove the 's'
        if (f.isDirectory()) {
            const files = readdirSync(path.join(folderPath, f.name), {
                withFileTypes: true,
            });
            for (let file of files) {
                let { default: handler }: { default: Handler } = await import(
                    path.join(folderPath, f.name, file.name)
                );

                let forf = f.name.replace(
                    new RegExp("s$", "g"),
                    ""
                ) as YukamiInteractionType;

                map.set(`${forf}_${file.name.replace(".ts", "")}`, {
                    handler,
                    for: forf,
                });
            }
        } else {
            let { default: handler }: { default: Handler } = await import(
                path.join(folderPath, f.name)
            );

            let forf = f.name.replace(
                new RegExp("s$", "g"),
                ""
            ) as YukamiInteractionType;

            map.set(`${forf}_${f.name.replace(".ts", "")}`, {
                handler,
                for: "slash",
            });
        }
    }

    return map;
}

export default eventBuilder<"interactionCreate">(async (interaction) => {
    const startTime = Date.now();
    let avatars = await Avatar.findAll({
        where: { userId: interaction.user.id },
        order: [["createdAt", "DESC"]],
    });

    try {
        const map = await loadAllInteractionFiles();
        if (interaction.isChatInputCommand()) {
            let command = interaction.commandName;
            let handler = map.get(`slash_${command}`);
            if (handler) {
                await interaction.deferReply();
                await handler.handler(interaction, avatars, (options) => {
                    interaction.editReply(options);
                });
            }
        } else if (interaction.isButton()) {
            let handler = map.get(`button_${interaction.customId}`);

            // Try with customId being dynamic

            if (!handler) {
                let customIdWithoutSuffix =
                    interaction.customId
                        .split("_")
                        .reverse()
                        .slice(1)
                        .reverse()
                        .join("_") + "_";

                console.log(customIdWithoutSuffix);
                handler = map.get(`button_${customIdWithoutSuffix}`);
            }

            if (handler) {
                await interaction.deferReply();
                await interaction.deleteReply();
                await handler.handler(interaction, avatars, (options) => {
                    interaction.message.edit(options);
                });
            }
        } else if (interaction.isAnySelectMenu()) {
            let handler = map.get(`select_${interaction.customId}`);

            if (!handler) {
                let customIdWithoutSuffix =
                    interaction.customId
                        .split("_")
                        .reverse()
                        .slice(1)
                        .reverse()
                        .join("_") + "_";
                handler = map.get(`button_${customIdWithoutSuffix}`);
            }

            if (handler) {
                await interaction.deferReply();
                await interaction.deleteReply();
                await handler.handler(interaction, avatars, (options) => {
                    interaction.message.edit(options);
                });
            }
        } else if (interaction.isModalSubmit()) {
            let handler = map.get(`modal_${interaction.customId}`);

            if (!handler) {
                let customIdWithoutSuffix =
                    interaction.customId
                        .split("_")
                        .reverse()
                        .slice(1)
                        .reverse()
                        .join("_") + "_";

                handler = map.get(`button_${customIdWithoutSuffix}`);
            }

            if (handler) {
                await interaction.deferReply();
                await interaction.deleteReply();
                await handler.handler(interaction, avatars, (options) => {
                    interaction.message!.edit(options);
                });
            }
        } else {
            console.error(
                "❌ Unknown interaction type:",
                interaction.type,
                interaction
            );
        }
    } catch (error) {
        console.error("❌ Error in interactionCreate:", {
            error,
        });
        await handleInteractionError(interaction, error as Error);
    }
});

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
        await interaction.editReply({ embeds: [errorEmbed] });
    } catch (replyError) {
        console.error("Failed to send error message:", replyError);
    }
}
