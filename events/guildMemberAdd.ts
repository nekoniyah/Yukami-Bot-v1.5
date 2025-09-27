import { userMention } from "discord.js";
import { Welcome } from "../utils/models";
import eventBuilder from "../utils/eventBuilder";

export default eventBuilder<"guildMemberAdd">(async (member) => {
    const welcome = await Welcome.findOne({
        where: { guildId: member.guild.id },
    });

    if (!welcome) return;

    if (welcome.get("channelId")) {
        const channel = await member.guild.channels.fetch(
            welcome.get("channelId") as string
        );

        if (channel?.isTextBased())
            channel.send(
                (welcome.get("message") as string)
                    .replace("{user.mention}", userMention(member.user.id))
                    .replace("{server.name}", member.guild.name)
                    .replace("{user.name}", member.user.username)
            );
    }

    if (welcome.get("user-roles") && !member.user.bot) {
        const roleIds = welcome.get("user-roles") as string;

        roleIds.split(",").forEach(async (roleId) => {
            const role = await member.guild.roles.fetch(roleId);
            if (role) member.roles.add(role).catch(console.error);
        });
    }

    if (welcome.get("bot-roles") && member.user.bot) {
        const roleIds = welcome.get("bot-roles") as string;

        roleIds.split(",").forEach(async (roleId) => {
            const role = await member.guild.roles.fetch(roleId);
            if (role) member.roles.add(role).catch(console.error);
        });
    }
});
