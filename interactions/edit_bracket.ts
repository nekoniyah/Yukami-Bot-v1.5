import { ButtonInteraction, EmbedBuilder } from "discord.js";
import { Avatar } from "../utils/models";

export default async function (
    interaction: ButtonInteraction,
    avatars: Avatar[]
) {
    let message = await interaction.message.fetch(true);

    let embed = EmbedBuilder.from(message.embeds[0])
        .setDescription(
            "Please provide a new bracket (include the word 'text')."
        )
        .setColor("#5865F2")
        .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL(),
        })
        .setFooter({
            text: process.env.NAME + " • Edit Avatar",
            iconURL: interaction.client.user?.displayAvatarURL(),
        });

    let avatar = avatars.find(
        (a) =>
            a.get("name") === message.embeds[0].title?.replace("Editing ", "")
    );

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

    if (!msg.content.includes("text")) {
        await interaction.editReply({
            content: "Please include 'text'",
        });

        setTimeout(() => {
            interaction.deleteReply();
        }, 30000);
    }

    await Avatar.update(
        { bracket: msg.content },
        { where: { userId: interaction.user.id, id: avatar?.get("id") } }
    );

    embed.setDescription(null).setFields(
        {
            name: "Name",
            value: avatar?.get("name") as string,
        },
        {
            name: "Bracket",
            value: msg.content,
        }
    );

    await msg.delete();

    await message.edit({ embeds: [embed] });
}
