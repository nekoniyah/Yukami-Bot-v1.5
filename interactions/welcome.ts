import { ChatInputCommandInteraction, MessageMentions } from "discord.js";
import { Welcome } from "../utils/models";

export default async function (interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "message") {
        const content = interaction.options.getString("content", true);
        const channel = interaction.options.getChannel("channel", true);

        let [, created] = await Welcome.findOrCreate({
            where: { guildId: interaction.guild.id },
            defaults: {
                channelId: channel.id,
                message: content,
            },
        });

        if (!created) {
            await Welcome.update(
                {
                    channelId: channel.id,
                    message: content,
                },
                {
                    where: { guildId: interaction.guild.id },
                }
            );
        }

        // Set the welcome message in the database or configuration
        await interaction.editReply({
            content: `Welcome message set for ${channel}:\n${content}`,
        });
    }

    if (subcommand === "user-roles") {
        const roles = interaction.options.getString("roles", true);
        const roleIds = roles
            .split(",")
            .map((role) => role.trim().match(MessageMentions.RolesPattern))
            .map((r) => (r ? r[1] : null))
            .filter((r) => r !== null);

        if (!roleIds.length)
            return await interaction.editReply({
                content: "No valid roles found.",
            });

        let [, created] = await Welcome.findOrCreate({
            where: { guildId: interaction.guild.id },
            defaults: {
                userRoleIds: roleIds.join(","),
                guildId: interaction.guildId,
            },
        });

        if (!created) {
            await Welcome.update(
                {
                    userRoleIds: roleIds.join(","),
                },
                {
                    where: { guildId: interaction.guild.id },
                }
            );
        }

        await interaction.editReply({
            content: `User roles set for ${
                interaction.guild.name
            }: ${roleIds.join(", ")}`,
        });
    }

    if (subcommand === "bot-roles") {
        const roles = interaction.options.getString("roles", true);
        const roleIds = roles
            .split(",")
            .map((role) => role.trim().match(MessageMentions.RolesPattern))
            .map((r) => (r ? r[1] : null))
            .filter((r) => r !== null);

        if (!roleIds.length)
            return await interaction.editReply({
                content: "No valid roles found.",
            });

        let [, created] = await Welcome.findOrCreate({
            where: { guildId: interaction.guild.id },
            defaults: {
                botRoleIds: roleIds.join(","),
                guildId: interaction.guildId,
            },
        });

        if (!created) {
            await Welcome.update(
                {
                    botRoleIds: roleIds.join(","),
                },
                {
                    where: { guildId: interaction.guild.id },
                }
            );
        }

        await interaction.editReply({
            content: `Bot roles set for ${
                interaction.guild.name
            }: ${roleIds.join(", ")}`,
        });
    }
}
