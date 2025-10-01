import { ForumThreadChannel, PartialUser, User } from "discord.js";
import eventBuilder from "../../utils/eventBuilder";

export default eventBuilder<"messageReactionAdd">(async (reaction, user) => {
    if (user.bot) return;
    if (!reaction.message.guild) return;

    let actualPostChannel =
        (await reaction.message.channel.fetch()) as ForumThreadChannel;

    let member = await reaction.message.guild.members.fetch(user.id);
    if (!member.permissions.has("Administrator")) return;
    if (
        actualPostChannel.parentId !==
        process.env.CHARACTER_VERIFICATION_CHANNEL_ID
    )
        return;

    if (!reaction.message.channel.isThread()) return;

    let starter = await reaction.message.channel.fetchStarterMessage();

    let originalMember = await reaction.message.guild.members.fetch(
        starter!.author.id
    );

    const nonVerifiedRole = await reaction.message.guild.roles.fetch(
        process.env.NONVERIFIED_ROLE_ID!
    );
    if (nonVerifiedRole && originalMember.roles.cache.has(nonVerifiedRole.id)) {
        await originalMember.roles.remove(nonVerifiedRole);
    }

    let firstSheetRoleId = "1419786136938746066";
    let secondSheetRoleId = "1419786184640565258";
    let thirdSheetRoleId = "1419786229708488775";

    const firstSheetRole = await reaction.message.guild.roles.fetch(
        firstSheetRoleId
    );
    const secondSheetRole = await reaction.message.guild.roles.fetch(
        secondSheetRoleId
    );
    const thirdSheetRole = await reaction.message.guild.roles.fetch(
        thirdSheetRoleId
    );

    if (!originalMember.roles.cache.has(firstSheetRoleId) && firstSheetRole) {
        await originalMember.roles.add(firstSheetRole);
    }

    // if (originalMember.roles.cache.has(firstSheetRoleId) && secondSheetRole) {
    //     await originalMember.roles.add(secondSheetRole);
    // }

    // if (originalMember.roles.cache.has(secondSheetRoleId) && thirdSheetRole) {
    //     await originalMember.roles.add(thirdSheetRole);
    // }
});
