import { userMention, TextChannel } from "discord.js";
import { Welcome } from "../utils/models";
import { createWelcomeEmbed, createErrorEmbed } from "../utils/embeds";
import eventBuilder from "../utils/eventBuilder";

export default eventBuilder<"guildMemberAdd">(async (member) => {
    try {
        const welcome = await Welcome.findOne({
            where: { guildId: member.guild.id },
        });

        if (!welcome) return;

        // Send welcome message if channel is configured
        if (welcome.get("channelId")) {
            const channel = await member.guild.channels.fetch(
                welcome.get("channelId") as string
            );

            if (channel?.isTextBased()) {
                const customMessage = welcome.get("message") as string;

                // Create enhanced welcome embed
                const welcomeEmbed = createWelcomeEmbed(
                    member.user,
                    member.guild.name,
                    customMessage
                )
                    .addFormattedField(
                        "Joined",
                        `<t:${Math.floor(Date.now() / 1000)}:R>`,
                        true
                    )
                    .addFormattedField(
                        "Account Created",
                        `<t:${Math.floor(
                            member.user.createdTimestamp / 1000
                        )}:R>`,
                        true
                    );

                // Add server stats
                const memberCount = member.guild.memberCount;
                welcomeEmbed.addFormattedField(
                    "Member Count",
                    `🎉 You're member #${memberCount}!`,
                    true
                );

                await (channel as TextChannel).send({
                    content: userMention(member.user.id),
                    embeds: [welcomeEmbed],
                });
            }
        }

        // Assign user roles if configured
        if (welcome.get("user-roles") && !member.user.bot) {
            const roleIds = welcome.get("user-roles") as string;
            const rolePromises = roleIds.split(",").map(async (roleId) => {
                try {
                    const role = await member.guild.roles.fetch(roleId.trim());
                    if (role) {
                        await member.roles.add(role);
                        console.log(
                            `Added role ${role.name} to user ${member.user.tag}`
                        );
                    }
                } catch (error) {
                    console.error(
                        `Failed to add role ${roleId} to user ${member.user.tag}:`,
                        error
                    );
                }
            });

            await Promise.allSettled(rolePromises);
        }

        // Assign bot roles if configured
        if (welcome.get("bot-roles") && member.user.bot) {
            const roleIds = welcome.get("bot-roles") as string;
            const rolePromises = roleIds.split(",").map(async (roleId) => {
                try {
                    const role = await member.guild.roles.fetch(roleId.trim());
                    if (role) {
                        await member.roles.add(role);
                        console.log(
                            `Added role ${role.name} to bot ${member.user.tag}`
                        );
                    }
                } catch (error) {
                    console.error(
                        `Failed to add role ${roleId} to bot ${member.user.tag}:`,
                        error
                    );
                }
            });

            await Promise.allSettled(rolePromises);
        }
    } catch (error) {
        console.error(
            `Welcome system error for ${member.user.tag} in ${member.guild.name}:`,
            error
        );
    }
});
