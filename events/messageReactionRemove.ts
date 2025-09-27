import {
    MessageReaction,
    PartialMessageReaction,
    User,
    PartialUser,
} from "discord.js";
import eventBuilder from "../utils/eventBuilder";
import { ReactionRole } from "../utils/models";

function getEmojiIdentifier(
    reaction: MessageReaction | PartialMessageReaction
) {
    return reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name;
}

export default eventBuilder<"messageReactionRemove">(
    async (
        reaction: MessageReaction | PartialMessageReaction,
        user: User | PartialUser
    ) => {
        if (user.bot) return;
        if (!reaction.message.guild) return;

        const rr = await ReactionRole.findOne({
            where: {
                guildId: reaction.message.guild.id,
                messageId: reaction.message.id,
                emoji: getEmojiIdentifier(reaction),
            },
        });
        if (!rr) return;

        try {
            const member = await reaction.message.guild.members.fetch(user.id);
            const roleIds = (rr.get("roleIds") as string).split(",");

            for (const roleId of roleIds) {
                const role = await reaction.message.guild.roles.fetch(roleId);
                if (role) {
                    await member.roles.remove(role);
                }
            }
        } catch {}
    }
);
