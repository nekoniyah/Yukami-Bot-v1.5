import {
    CategoryChannel,
    ChannelType,
    ChatInputCommandInteraction,
} from "discord.js";
import { createSuccessEmbed } from "../../utils/embeds";

export default async function channelCommand(
    interaction: ChatInputCommandInteraction
) {
    let subcommand = interaction.options.getSubcommand();
    let completeNameFormat = "◦•●◉✿ $1 • $2 ✿◉●•◦";
    let simpleNameFormat = "◦•●◉✿ $1 ✿◉●•◦";

    switch (subcommand) {
        case "create":
            const name = interaction.options.getString("name", true);
            const secondaryName =
                interaction.options.getString("secondary_name");

            let roleplayChannel = await interaction.guild?.channels.create({
                type: ChannelType.GuildCategory,
                name: secondaryName
                    ? completeNameFormat
                          .replace("$1", name)
                          .replace("$2", secondaryName)
                    : simpleNameFormat.replace("$1", name),
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [
                            "SendMessages",
                            "SendMessagesInThreads",
                            "CreatePublicThreads",
                            "CreatePrivateThreads",
                        ],
                    },
                    {
                        id: "1419786136938746066",
                        allow: ["SendMessages", "SendMessagesInThreads"],
                    },
                ],
            });

            interaction[interaction.deferred ? "editReply" : "reply"]({
                embeds: [
                    createSuccessEmbed(
                        "Salon créé",
                        "```" +
                            JSON.stringify({
                                [roleplayChannel?.id!]: {
                                    name: roleplayChannel?.name,
                                    connections: [],
                                },
                            }) +
                            "```"
                    ),
                ],
            });

            break;

        case "set":
            const channel = interaction.options.getChannel("channel", true, [
                ChannelType.GuildText,
                ChannelType.GuildCategory,
            ]);

            await channel.permissionOverwrites.set([
                {
                    id: interaction.guild!.roles.everyone.id,
                    deny: [
                        "SendMessages",
                        "SendMessagesInThreads",
                        "CreatePublicThreads",
                        "CreatePrivateThreads",
                    ],
                },
                {
                    id: "1419786136938746066",
                    allow: ["SendMessages", "SendMessagesInThreads"],
                },
            ]);

            if (channel instanceof CategoryChannel) {
                for (let [_, child] of channel.children.cache) {
                    await child.permissionOverwrites.set([
                        {
                            id: interaction.guild!.roles.everyone.id,
                            deny: [
                                "SendMessages",
                                "SendMessagesInThreads",
                                "CreatePublicThreads",
                                "CreatePrivateThreads",
                            ],
                        },
                        {
                            id: "1419786136938746066",
                            allow: ["SendMessages", "SendMessagesInThreads"],
                        },
                    ]);
                }
            }

            await interaction[interaction.deferred ? "editReply" : "reply"]({
                embeds: [
                    createSuccessEmbed(
                        "Salon mis à jour",
                        "```" +
                            JSON.stringify({
                                [channel?.id!]: {
                                    name: channel?.name,
                                    connections: [],
                                },
                            }) +
                            "```"
                    ),
                ],
            });

            break;
    }
}
