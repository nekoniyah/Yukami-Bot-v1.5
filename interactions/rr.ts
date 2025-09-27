import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Message,
    MessageMentions,
    StringSelectMenuBuilder,
} from "discord.js";
import { ReactionRole } from "../utils/models";
import locale from "../locales/locale";

export default async function rr(interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();
    const loc = await locale(interaction.locale ?? "en");

    if (sub === "add") {
        const messageId = interaction.options.getString("message_id", true);
        const roles = interaction.options.getString("roles", true).split(",");
        const emoji = interaction.options.getString("emoji", true);

        let roleIds = roles.map(
            (r) => r.match(MessageMentions.RolesPattern)![1]
        );

        if (messageId && roleIds.length >= 1) {
            let rr = await ReactionRole.create({
                guildId: interaction.guildId,
                messageId,
                emoji: emoji.replace(/<a?:\w+:\d+>/, ""),
                roleIds: roleIds.join(","),
            });

            await rr.save();

            for (let [
                ,
                channel,
            ] of await interaction.guild?.channels.fetch()!) {
                if (channel?.isTextBased()) {
                    try {
                        let message = await channel.messages.fetch(messageId);
                        if (message) {
                            await message.react(emoji);
                        }
                    } catch {}
                }
            }
        }

        const embed = new EmbedBuilder()
            .setTitle(loc.ui.reaction_roles.set_title)
            .setColor("#5865F2")
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setFields(
                {
                    name: "Roles",
                    value: roles.join(", "),
                    inline: false,
                },
                {
                    name: "Emoji",
                    value: emoji,
                    inline: true,
                }
            )
            .setDescription(
                loc.ui.reaction_roles.configured_for.replace("%s", messageId)
            )
            .setThumbnail(
                interaction.guild?.iconURL() ??
                    interaction.client.user.displayAvatarURL()
            )
            .setFooter({
                text: process.env.NAME + " • Reaction Roles",
                iconURL: interaction.client.user?.displayAvatarURL(),
            })
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    } else if (sub === "remove") {
        const all = await ReactionRole.findAll({
            where: { guildId: interaction.guildId },
        });

        let menu = new StringSelectMenuBuilder().setCustomId("select_rr");

        for (let a of all) {
            let messageId = a.get("messageId") as string;
            let message: Message | null = null;

            for (let [
                _,
                channel,
            ] of await interaction.guild?.channels.fetch()!) {
                if (channel?.isTextBased()) {
                    try {
                        message = await channel.messages.fetch(messageId);
                        break;
                    } catch {}
                }
            }

            if (message) {
                menu.addOptions({
                    emoji: { name: a.get("emoji") as string },
                    label: message.content.slice(0, 24) ?? "No Content",
                    value: `${a.get("id")}`,
                });
            }
        }

        const embed = new EmbedBuilder()
            .setTitle(loc.ui.reaction_roles.remove_title)
            .setColor("#5865F2")
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setThumbnail(
                interaction.guild?.iconURL() ??
                    interaction.client.user.displayAvatarURL()
            )
            .setFooter({
                text: process.env.NAME + " • Reaction Roles",
                iconURL: interaction.client.user?.displayAvatarURL(),
            })
            .setTimestamp();

        if (menu.options.length === 0) {
            embed.setDescription(loc.ui.reaction_roles.none);
            await interaction.editReply({
                embeds: [embed],
                components: [],
            });
        } else {
            await interaction.editReply({
                embeds: [embed],
                components: [
                    new ActionRowBuilder().addComponents(menu).toJSON(),
                ],
            });
        }
    }
}
