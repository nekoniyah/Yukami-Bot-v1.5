import {
    ChatInputCommandInteraction,
    MessageMentions,
    ChannelType,
} from "discord.js";
import { Welcome } from "../utils/models";
import {
    createSuccessEmbed,
    createErrorEmbed,
    createInfoEmbed,
    YukamiEmbed,
    EMBED_EMOJIS,
    formatChannelMention,
    formatRoleMention,
} from "../utils/embeds";

export default async function (interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
        const errorEmbed = createErrorEmbed(
            "Guild Required",
            "This command can only be used in a server."
        );
        return await interaction.editReply({ embeds: [errorEmbed] });
    }

    const subcommand = interaction.options.getSubcommand();

    try {
        if (subcommand === "message") {
            await handleMessageSubcommand(interaction);
        } else if (subcommand === "user-roles") {
            await handleUserRolesSubcommand(interaction);
        } else if (subcommand === "bot-roles") {
            await handleBotRolesSubcommand(interaction);
        } else if (subcommand === "preview") {
            await handlePreviewSubcommand(interaction);
        } else if (subcommand === "disable") {
            await handleDisableSubcommand(interaction);
        } else if (subcommand === "status") {
            await handleStatusSubcommand(interaction);
        }
    } catch (error) {
        console.error(
            `Welcome command error in ${interaction.guild.name}:`,
            error
        );

        const errorEmbed = createErrorEmbed(
            "Command Failed",
            "An error occurred while configuring the welcome system.",
            process.env.NODE_ENV === "production"
                ? undefined
                : (error as Error).message
        );

        await interaction.editReply({ embeds: [errorEmbed] });
    }
}

async function handleMessageSubcommand(
    interaction: ChatInputCommandInteraction
) {
    const content = interaction.options.getString("content", true);
    const channel = interaction.options.getChannel("channel", true);

    // Validate channel type
    if (!channel || channel.type === ChannelType.DM) {
        const errorEmbed = createErrorEmbed(
            "Invalid Channel",
            "Welcome messages can only be sent to text channels."
        );
        return await interaction.editReply({ embeds: [errorEmbed] });
    }

    // Validate message content
    if (content.length > 2000) {
        const errorEmbed = createErrorEmbed(
            "Message Too Long",
            "Welcome messages cannot exceed 2000 characters."
        );
        return await interaction.editReply({ embeds: [errorEmbed] });
    }

    const [welcome, created] = await Welcome.findOrCreate({
        where: { guildId: interaction.guild!.id },
        defaults: {
            channelId: channel.id,
            message: content,
            guildId: interaction.guild!.id,
        },
    });

    if (!created) {
        await Welcome.update(
            {
                channelId: channel.id,
                message: content,
            },
            {
                where: { guildId: interaction.guild!.id },
            }
        );
    }

    const successEmbed = createSuccessEmbed(
        "Welcome Message Configured",
        `Welcome messages will now be sent to ${formatChannelMention(
            channel.id
        )}`
    )
        .addFormattedField(
            "Message Preview",
            content.length > 500 ? content.substring(0, 500) + "..." : content
        )
        .addFormattedField(
            "Available Variables",
            "`{user.mention}` - Mentions the new member\n" +
                "`{user.name}` - User's display name\n" +
                "`{server.name}` - Server name"
        );

    await interaction.editReply({ embeds: [successEmbed] });
}

async function handleUserRolesSubcommand(
    interaction: ChatInputCommandInteraction
) {
    const roles = interaction.options.getString("roles", true);
    const roleIds = parseRoleIds(roles);

    if (!roleIds.length) {
        const errorEmbed = createErrorEmbed(
            "No Valid Roles Found",
            "Please provide valid role mentions or IDs.",
            "Example: `@Member @Verified` or `123456789,987654321`"
        );
        return await interaction.editReply({ embeds: [errorEmbed] });
    }

    // Validate roles exist and bot can assign them
    const validRoles = [];
    const invalidRoles = [];

    for (const roleId of roleIds) {
        try {
            const role = await interaction.guild!.roles.fetch(roleId);
            if (role) {
                if (role.managed) {
                    invalidRoles.push(`${role.name} (managed by integration)`);
                } else if (
                    role.position >=
                    interaction.guild!.members.me!.roles.highest.position
                ) {
                    invalidRoles.push(`${role.name} (higher than bot's role)`);
                } else {
                    validRoles.push({ id: roleId, name: role.name });
                }
            } else {
                invalidRoles.push(`Unknown role (${roleId})`);
            }
        } catch (error) {
            invalidRoles.push(`Invalid role (${roleId})`);
        }
    }

    if (!validRoles.length) {
        const errorEmbed = createErrorEmbed(
            "No Assignable Roles",
            "None of the provided roles can be assigned to new members.",
            invalidRoles.join("\n")
        );
        return await interaction.editReply({ embeds: [errorEmbed] });
    }

    const [welcome, created] = await Welcome.findOrCreate({
        where: { guildId: interaction.guild!.id },
        defaults: {
            userRoleIds: validRoles.map((r) => r.id).join(","),
            guildId: interaction.guild!.id,
        },
    });

    if (!created) {
        await Welcome.update(
            {
                userRoleIds: validRoles.map((r) => r.id).join(","),
            },
            {
                where: { guildId: interaction.guild!.id },
            }
        );
    }

    const successEmbed = createSuccessEmbed(
        "User Auto-Roles Configured",
        `New users will automatically receive ${validRoles.length} role${
            validRoles.length !== 1 ? "s" : ""
        }`
    ).addFormattedField(
        "Assigned Roles",
        validRoles
            .map((r) => `• ${formatRoleMention(r.id)} (${r.name})`)
            .join("\n")
    );

    if (invalidRoles.length > 0) {
        successEmbed.addFormattedField(
            "⚠️ Skipped Roles",
            invalidRoles.map((r) => `• ${r}`).join("\n")
        );
    }

    await interaction.editReply({ embeds: [successEmbed] });
}

async function handleBotRolesSubcommand(
    interaction: ChatInputCommandInteraction
) {
    const roles = interaction.options.getString("roles", true);
    const roleIds = parseRoleIds(roles);

    if (!roleIds.length) {
        const errorEmbed = createErrorEmbed(
            "No Valid Roles Found",
            "Please provide valid role mentions or IDs.",
            "Example: `@Bot @Verified-Bot` or `123456789,987654321`"
        );
        return await interaction.editReply({ embeds: [errorEmbed] });
    }

    // Validate roles (same logic as user roles)
    const validRoles = [];
    const invalidRoles = [];

    for (const roleId of roleIds) {
        try {
            const role = await interaction.guild!.roles.fetch(roleId);
            if (role) {
                if (role.managed) {
                    invalidRoles.push(`${role.name} (managed by integration)`);
                } else if (
                    role.position >=
                    interaction.guild!.members.me!.roles.highest.position
                ) {
                    invalidRoles.push(`${role.name} (higher than bot's role)`);
                } else {
                    validRoles.push({ id: roleId, name: role.name });
                }
            } else {
                invalidRoles.push(`Unknown role (${roleId})`);
            }
        } catch (error) {
            invalidRoles.push(`Invalid role (${roleId})`);
        }
    }

    if (!validRoles.length) {
        const errorEmbed = createErrorEmbed(
            "No Assignable Roles",
            "None of the provided roles can be assigned to new bots.",
            invalidRoles.join("\n")
        );
        return await interaction.editReply({ embeds: [errorEmbed] });
    }

    const [welcome, created] = await Welcome.findOrCreate({
        where: { guildId: interaction.guild!.id },
        defaults: {
            botRoleIds: validRoles.map((r) => r.id).join(","),
            guildId: interaction.guild!.id,
        },
    });

    if (!created) {
        await Welcome.update(
            {
                botRoleIds: validRoles.map((r) => r.id).join(","),
            },
            {
                where: { guildId: interaction.guild!.id },
            }
        );
    }

    const successEmbed = createSuccessEmbed(
        "Bot Auto-Roles Configured",
        `New bots will automatically receive ${validRoles.length} role${
            validRoles.length !== 1 ? "s" : ""
        }`
    ).addFormattedField(
        "Assigned Roles",
        validRoles
            .map((r) => `• ${formatRoleMention(r.id)} (${r.name})`)
            .join("\n")
    );

    if (invalidRoles.length > 0) {
        successEmbed.addFormattedField(
            "⚠️ Skipped Roles",
            invalidRoles.map((r) => `• ${r}`).join("\n")
        );
    }

    await interaction.editReply({ embeds: [successEmbed] });
}

async function handlePreviewSubcommand(
    interaction: ChatInputCommandInteraction
) {
    const welcome = await Welcome.findOne({
        where: { guildId: interaction.guild!.id },
    });

    if (!welcome) {
        const infoEmbed = createInfoEmbed(
            "No Welcome Configuration",
            "Welcome system is not configured for this server. Use the other subcommands to set it up."
        );
        return await interaction.editReply({ embeds: [infoEmbed] });
    }

    // Create preview of what new members will see
    const previewEmbed = createSuccessEmbed(
        "Welcome Message Preview",
        "This is how the welcome message will appear to new members:"
    );

    const message = welcome.get("message") as string;
    const channelId = welcome.get("channelId") as string;

    if (message && channelId) {
        const previewMessage = message
            .replace("{user.mention}", interaction.user.toString())
            .replace("{user.name}", interaction.user.displayName)
            .replace("{server.name}", interaction.guild!.name);

        previewEmbed.addFormattedField("Message", previewMessage);
        previewEmbed.addFormattedField(
            "Channel",
            formatChannelMention(channelId),
            true
        );
    }

    // Show configured roles
    const userRoles = welcome.get("userRoleIds") as string;
    const botRoles = welcome.get("botRoleIds") as string;

    if (userRoles) {
        const roleList = userRoles
            .split(",")
            .map((id) => formatRoleMention(id))
            .join(" ");
        previewEmbed.addFormattedField("User Auto-Roles", roleList, true);
    }

    if (botRoles) {
        const roleList = botRoles
            .split(",")
            .map((id) => formatRoleMention(id))
            .join(" ");
        previewEmbed.addFormattedField("Bot Auto-Roles", roleList, true);
    }

    await interaction.editReply({ embeds: [previewEmbed] });
}

async function handleDisableSubcommand(
    interaction: ChatInputCommandInteraction
) {
    const welcome = await Welcome.findOne({
        where: { guildId: interaction.guild!.id },
    });

    if (!welcome) {
        const infoEmbed = createInfoEmbed(
            "Nothing to Disable",
            "Welcome system is not currently configured for this server."
        );
        return await interaction.editReply({ embeds: [infoEmbed] });
    }

    await Welcome.destroy({
        where: { guildId: interaction.guild!.id },
    });

    const successEmbed = createSuccessEmbed(
        "Welcome System Disabled",
        "All welcome configurations have been removed for this server."
    );

    await interaction.editReply({ embeds: [successEmbed] });
}

async function handleStatusSubcommand(
    interaction: ChatInputCommandInteraction
) {
    const welcome = await Welcome.findOne({
        where: { guildId: interaction.guild!.id },
    });

    const statusEmbed = new YukamiEmbed()
        .setTitle(`${EMBED_EMOJIS.SETTINGS} Welcome System Status`)
        .setBotFooter();

    if (!welcome) {
        statusEmbed
            .asWarning()
            .setDescription("Welcome system is **disabled** for this server.")
            .addFormattedField(
                "Get Started",
                "Use `/welcome message` to configure welcome messages\n" +
                    "Use `/welcome user-roles` to set auto-roles for users\n" +
                    "Use `/welcome bot-roles` to set auto-roles for bots"
            );
    } else {
        statusEmbed
            .asSuccess()
            .setDescription("Welcome system is **enabled** for this server.");

        const message = welcome.get("message") as string;
        const channelId = welcome.get("channelId") as string;
        const userRoles = welcome.get("userRoleIds") as string;
        const botRoles = welcome.get("botRoleIds") as string;

        if (message && channelId) {
            statusEmbed.addFormattedField(
                "✅ Welcome Messages",
                `Channel: ${formatChannelMention(
                    channelId
                )}\nMessage configured: Yes`,
                true
            );
        } else {
            statusEmbed.addFormattedField(
                "❌ Welcome Messages",
                "Not configured",
                true
            );
        }

        if (userRoles) {
            const roleCount = userRoles.split(",").length;
            statusEmbed.addFormattedField(
                "✅ User Auto-Roles",
                `${roleCount} role${roleCount !== 1 ? "s" : ""} configured`,
                true
            );
        } else {
            statusEmbed.addFormattedField(
                "❌ User Auto-Roles",
                "Not configured",
                true
            );
        }

        if (botRoles) {
            const roleCount = botRoles.split(",").length;
            statusEmbed.addFormattedField(
                "✅ Bot Auto-Roles",
                `${roleCount} role${roleCount !== 1 ? "s" : ""} configured`,
                true
            );
        } else {
            statusEmbed.addFormattedField(
                "❌ Bot Auto-Roles",
                "Not configured",
                true
            );
        }
    }

    await interaction.editReply({ embeds: [statusEmbed] });
}

function parseRoleIds(roles: string): string[] {
    return roles
        .split(",")
        .map((role) => {
            const trimmed = role.trim();
            const match = trimmed.match(MessageMentions.RolesPattern);
            return match ? match[1] : trimmed;
        })
        .filter((r) => r && r.length > 0);
}
