import { ButtonInteraction, EmbedBuilder } from "discord.js";
import { Avatar } from "../utils/models";
import locale from "../locales/locale";

export default async function (
    interaction: ButtonInteraction,
    avatars: Avatar[]
) {
    let message = await interaction.message.fetch(true);

    let avatar = avatars.find(
        (a) =>
            a.get("name") === message.embeds[0].title?.replace("Editing ", "")
    );
    const loc = await locale(interaction.locale ?? "en");

    let embed = EmbedBuilder.from(message.embeds[0])
        .setDescription(loc.ui.avatars.create_prompt_name)
        .setColor("#5865F2")
        .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL(),
        })
        .setFooter({
            text: (process.env.NAME ?? "Luo") + " • Edit Avatar",
            iconURL: interaction.client.user?.displayAvatarURL(),
        });

    message.edit({ embeds: [embed] });
    interaction.deleteReply();

    let msg = (
        await message.channel.awaitMessages({
            filter: (m) => m.author.id === interaction.user.id,
            max: 1,
            time: 30000,
            errors: ["time"],
        })
    ).first();

    if (!msg) return;

    await Avatar.update(
        { name: msg.content },
        { where: { userId: interaction.user.id, id: avatar?.get("id") } }
    );

    embed
        .setDescription(null)
        .setFields(
            {
                name: "Name",
                value: msg.content,
            },
            {
                name: "Bracket",
                value: avatar?.get("bracket") as string,
            }
        )
        .setTitle(loc.ui.avatars.editing_title.replace("%s", msg.content));

    await msg.delete();

    await message.edit({ embeds: [embed] });
}
