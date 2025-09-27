import {
    ChannelType,
    PermissionFlagsBits,
    PermissionsBitField,
    SlashCommandBuilder,
} from "discord.js";

export default new SlashCommandBuilder()
    .setName("welcome")
    .setDescription("Welcome new members to the server and assign roles")
    .addSubcommand((sc) =>
        sc
            .setName("message")
            .setDescription("Set the welcome message for new members")
            .addStringOption((o) =>
                o
                    .setName("content")
                    .setDescription("The welcome message content")
                    .setRequired(true)
            )
            .addChannelOption((o) =>
                o
                    .setName("channel")
                    .setDescription("The channel to send the welcome message")
                    .setRequired(true)
                    .addChannelTypes(ChannelType.GuildText)
            )
    )
    .addSubcommand((sc) =>
        sc
            .setName("user-roles")
            .setDescription("Set the roles to assign to new members")
            .addStringOption((o) =>
                o
                    .setName("roles")
                    .setDescription(
                        "The roles to assign to new members (separate with commas)"
                    )
                    .setRequired(true)
            )
    )
    .addSubcommand((sc) =>
        sc
            .setName("bot-roles")
            .setDescription("Set the roles to assign to new bots")
            .addStringOption((o) =>
                o
                    .setName("roles")
                    .setDescription(
                        "The roles to assign to new bots (separate with commas)"
                    )
                    .setRequired(true)
            )
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild);
