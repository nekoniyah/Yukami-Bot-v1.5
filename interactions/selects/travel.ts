import {
    AnySelectMenuInteraction,
    ChannelType,
    StringSelectMenuInteraction,
} from "discord.js";
import { Handler } from "../../events/interactionCreate";
import { loadRoleplayChannels, RoleplayChannels } from "../slashs/travel";
import { createSuccessEmbed } from "../../utils/embeds";

// Hide all roleplay channels for user
async function hideAllRoleplayChannels(
    interaction: StringSelectMenuInteraction,
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
    interaction: StringSelectMenuInteraction,
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

export default (async function travel(
    interaction: StringSelectMenuInteraction,
    avatars,
    callback
) {
    const roleplayChannels = loadRoleplayChannels();
    const destinationId = interaction.values[0];
    const destination = roleplayChannels.channels[destinationId];

    if (!destination) {
        callback({
            content: "❌ Destination invalide.",
        });

        return;
    }

    try {
        // Hide all roleplay channels first
        await hideAllRoleplayChannels(interaction, roleplayChannels);

        // Show only the destination channel
        await showChannelForUser(interaction, destinationId);

        const embed = createSuccessEmbed("Voyage effectué");

        await callback({
            embeds: [embed],
        });
    } catch (error) {
        console.error("Erreur lors du voyage:", error);
        await callback({
            content: "❌ Une erreur s'est produite lors du voyage.",
        });
    }

    return;
} as Handler<AnySelectMenuInteraction>);
