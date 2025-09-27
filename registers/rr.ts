import { PermissionsBitField, SlashCommandBuilder } from "discord.js";

export default new SlashCommandBuilder()
    .setName("rr")
    .setDescription("Reaction Roles Commands")
    .addSubcommand((sc) =>
        sc
            .setName("add")
            .setDescription("Add a reaction role to a message")
            .addStringOption((opt) =>
                opt
                    .setName("message_id")
                    .setDescription(
                        "The ID of the message to add the reaction role to"
                    )
                    .setRequired(true)
            )
            .addStringOption((opt) =>
                opt
                    .setName("roles")
                    .setDescription(
                        "The list of mentionned roles separated by commas"
                    )
                    .setRequired(true)
            )
            .addStringOption((opt) =>
                opt
                    .setName("emoji")
                    .setDescription(
                        "the emoji in ':' to setup the reaction role"
                    )
                    .setRequired(true)
            )
    )
    .addSubcommand((sc) =>
        sc.setName("remove").setDescription("Remove an existing reaction role")
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles);
