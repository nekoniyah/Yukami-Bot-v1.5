import {
    StringSelectMenuInteraction,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    EmbedBuilder,
    ChannelType,
    PermissionFlagsBits,
    ChatInputCommandInteraction,
} from "discord.js";
import fs from "fs";
import path from "path";

interface RoleplayChannel {
    name: string;
    connections: string[];
}

interface RoleplayChannels {
    channels: Record<string, RoleplayChannel>;
}

// Load roleplay channels configuration
function loadRoleplayChannels(): RoleplayChannels {
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

// Hide all roleplay channels for user
async function hideAllRoleplayChannels(
    interaction: ChatInputCommandInteraction | StringSelectMenuInteraction,
    roleplayChannels: RoleplayChannels
) {
    const member = interaction.guild!.members.cache.get(interaction.user.id);
    if (!member) return;

    const promises = Object.keys(roleplayChannels.channels).map(
        async (channelId) => {
            const channel = interaction.guild!.channels.cache.get(channelId);
            if (channel && channel.type === ChannelType.GuildText) {
                try {
                    await channel.permissionOverwrites.edit(member, {
                        ViewChannel: false,
                    });
                } catch (error) {
                    console.error(
                        `Erreur lors du masquage du canal ${channelId}:`,
                        error
                    );
                }
            } else if (channel && channel.type === ChannelType.GuildCategory) {
                try {
                    await channel.permissionOverwrites.edit(member, {
                        ViewChannel: false,
                    });

                    for (let [_, child] of channel.children.cache) {
                        await child.permissionOverwrites.edit(member, {
                            ViewChannel: false,
                        });
                    }
                } catch (error) {
                    console.error(
                        `Erreur lors du masquage du canal ${channelId}:`,
                        error
                    );
                }
            }
        }
    );

    await Promise.all(promises);
}

// Show specific channel for user
async function showChannelForUser(
    interaction: ChatInputCommandInteraction | StringSelectMenuInteraction,
    channelId: string
) {
    const member = interaction.guild!.members.cache.get(interaction.user.id);
    if (!member) return;

    const channel = interaction.guild!.channels.cache.get(channelId);
    if (channel && channel.type === ChannelType.GuildText) {
        try {
            await channel.permissionOverwrites.edit(member, {
                ViewChannel: true,
            });
        } catch (error) {
            console.error(
                `Erreur lors de l'affichage du canal ${channelId}:`,
                error
            );
        }
    } else if (channel && channel.type === ChannelType.GuildCategory) {
        try {
            await channel.permissionOverwrites.edit(member, {
                ViewChannel: true,
            });

            for (let [_, child] of channel.children.cache) {
                await child.permissionOverwrites.edit(member, {
                    ViewChannel: true,
                });
            }
        } catch (error) {
            console.error(
                `Erreur lors de l'affichage du canal ${channelId}:`,
                error
            );
        }
    }
}

export default async function travel(
    interaction: ChatInputCommandInteraction | StringSelectMenuInteraction
) {
    if (!interaction.guild) {
        return interaction.editReply({
            content:
                "❌ Cette commande ne peut être utilisée que sur un serveur.",
        });
    }

    const roleplayChannels = loadRoleplayChannels();
    const currentChannelId = interaction.channelId;

    // Handle select menu interaction (user chose a destination)
    if (
        interaction.isStringSelectMenu() &&
        interaction.customId === "travel_select"
    ) {
        const destinationId = interaction.values[0];
        const destination = roleplayChannels.channels[destinationId];

        if (!destination) {
            return interaction.editReply({
                content: "❌ Destination invalide.",
            });
        }

        try {
            // Hide all roleplay channels first
            await hideAllRoleplayChannels(interaction, roleplayChannels);

            // Show only the destination channel
            await showChannelForUser(interaction, destinationId);

            const embed = new EmbedBuilder()
                .setColor("#10B981")
                .setTitle("🚀 Voyage Réussi!")
                .setDescription(`Vous êtes maintenant dans ${destination.name}`)
                .setTimestamp();

            await interaction.editReply({
                embeds: [embed],
            });
        } catch (error) {
            console.error("Erreur lors du voyage:", error);
            await interaction.editReply({
                content: "❌ Une erreur s'est produite lors du voyage.",
            });
        }

        return;
    }

    // Handle slash command (show travel options)
    if (interaction.isChatInputCommand()) {
        const currentChannel = roleplayChannels.channels[currentChannelId];

        if (!currentChannel) {
            return interaction.editReply({
                content: "❌ Vous ne pouvez pas voyager depuis ce canal.",
            });
        }

        // Get available destinations
        const availableDestinations = currentChannel.connections
            .map((channelId) => ({
                id: channelId,
                ...roleplayChannels.channels[channelId],
            }))
            .filter((dest) => dest.name); // Only valid channels

        if (availableDestinations.length === 0) {
            return interaction.editReply({
                content: "❌ Aucune destination disponible depuis ce lieu.",
            });
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

        const embed = new EmbedBuilder()
            .setColor("#3B82F6")
            .setTitle("🗺️ Système de Voyage")
            .setDescription(
                `**Localisation actuelle:** ${currentChannel.name}\n\nSélectionnez votre destination ci-dessous:`
            )
            .addFields({
                name: "🧭 Destinations Disponibles",
                value: availableDestinations
                    .map((dest) => `• ${dest.name}`)
                    .join("\n"),
            })
            .setFooter({
                text: "Le voyage masquera tous les autres canaux RP",
            })
            .setTimestamp();

        await interaction.editReply({
            embeds: [embed],
            components: [actionRow],
        });
    }
}
