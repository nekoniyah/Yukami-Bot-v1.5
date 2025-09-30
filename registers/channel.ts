import {
    ChannelType,
    PermissionsBitField,
    SlashCommandBuilder,
} from "discord.js";

export default new SlashCommandBuilder()
    .setName("channel")
    .setDescription("Gestionnaire de salons de roleplay")
    .addSubcommand((sc) =>
        sc
            .setName("create")
            .setDescription("Créer un salon de roleplay")
            .addStringOption((o) =>
                o
                    .setName("name")
                    .setDescription("Le nom du salon de roleplay")
                    .setRequired(true)
            )
            .addStringOption((o) =>
                o
                    .setName("secondary_name")
                    .setDescription("Le nom secondaire du salon de roleplay")
                    .setRequired(false)
            )
    )
    .addSubcommand((sc) =>
        sc
            .setName("set")
            .setDescription(
                "Mettre les bonnes permissions au salon de roleplay"
            )
            .addChannelOption((o) =>
                o
                    .setName("channel")
                    .setDescription("Le salon de roleplay")
                    .setRequired(true)
                    .addChannelTypes(
                        ChannelType.GuildText,
                        ChannelType.GuildCategory
                    )
            )
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild);
