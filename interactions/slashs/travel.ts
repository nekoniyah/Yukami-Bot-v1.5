import {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ChatInputCommandInteraction,
} from "discord.js";
import fs from "fs";
import path from "path";
import { Handler } from "../../events/interactionCreate";
import { YukamiEmbed } from "../../utils/embeds";

export interface RoleplayChannel {
    name: string;
    connections: string[];
}

export interface RoleplayChannels {
    channels: Record<string, RoleplayChannel>;
}

// Load roleplay channels configuration
export function loadRoleplayChannels(): RoleplayChannels {
    try {
        const channelsPath = path.join(
            process.cwd(),
            "db",
            "roleplay_channels.json"
        );
        const data = fs.readFileSync(channelsPath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Erreur lors du chargement des canaux RP:", error);
        return { channels: {} };
    }
}

export default (async function travel(interaction, avatars, callback) {
    if (!interaction.guild) {
        callback({
            content:
                "❌ Cette commande ne peut être utilisée que sur un serveur.",
        });
        return;
    }

    const roleplayChannels = loadRoleplayChannels();
    const currentChannelId = interaction.channelId;

    // Handle slash command (show travel options)
    if (interaction.isChatInputCommand()) {
        const currentChannel = roleplayChannels.channels[currentChannelId];

        if (!currentChannel) {
            callback({
                content: "❌ Vous ne pouvez pas voyager depuis ce canal.",
            });
            return;
        }

        // Get available destinations
        const availableDestinations = currentChannel.connections
            .map((channelId) => ({
                id: channelId,
                ...roleplayChannels.channels[channelId],
            }))
            .filter((dest) => dest.name); // Only valid channels

        if (availableDestinations.length === 0) {
            callback({
                content: "❌ Aucune destination disponible depuis ce lieu.",
            });
            return;
        }

        // Create select menu with destinations
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("travel_select")
            .setPlaceholder("🧭 Choisissez votre destination...")
            .addOptions(
                availableDestinations.map((dest) => ({
                    label: dest.name,
                    value: dest.id,
                    emoji: dest.name.split(" ")[0], // Extract emoji from name
                }))
            );

        const actionRow =
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                selectMenu
            );

        const embed = new YukamiEmbed()
            .setColor("#3B82F6")
            .setTitle("🗺️ Système de Voyage")
            .setBotFooter();

        await callback({
            embeds: [embed],
            components: [actionRow],
        });
    }
} as Handler<ChatInputCommandInteraction>);
