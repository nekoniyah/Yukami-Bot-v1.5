import { TextChannel } from "discord.js";
import { Avatar } from "../utils/models";
import eventBuilder from "../utils/eventBuilder";

async function webhookManager(channel: TextChannel) {
    const webhooks = await channel.fetchWebhooks();
    let avatarWebhook = webhooks.find(
        (wh) => wh.owner!.id === channel.client.user.id
    );

    return {
        get: () => avatarWebhook,
        async send(params: { content: string; avatar: string; name: string }) {
            if (!avatarWebhook) avatarWebhook = await this.create();
            await avatarWebhook!.send({
                content: params.content,
                avatarURL: params.avatar,
                username: params.name,
            });
        },
        async create() {
            if (avatarWebhook) return;

            let wbh = await channel.createWebhook({
                name: channel.client.user.username,
                avatar: channel.client.user.displayAvatarURL(),
            });

            return wbh;
        },
    };
}

export default eventBuilder<"messageCreate">(async (message) => {
    if (message.author.bot) return;
    if (message.channel.isDMBased()) return;

    let avatars = await Avatar.findAll({
        where: {
            userId: message.author.id,
        },
    });

    if (avatars.length === 0) return;

    let wbhManager = await webhookManager(message.channel as TextChannel);

    // Do something with the avatars

    for (let avatar of avatars) {
        let splittedBracket = (avatar.get("bracket") as string).split("text");
        let prefix = splittedBracket[0];
        let suffix = splittedBracket[1];

        if (prefix && message.content.startsWith(prefix)) {
            if (!suffix || (suffix && message.content.endsWith(suffix))) {
                // The message matches the avatar's bracket

                message.delete();

                let content_as_avatar = message.content
                    .replace(prefix, "")
                    .replace(suffix, "");

                wbhManager.send({
                    content: content_as_avatar,
                    avatar: avatar.get("icon") as string,
                    name: avatar.get("name") as string,
                });
            }
        }
    }
});
