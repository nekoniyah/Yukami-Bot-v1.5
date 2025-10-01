import { ButtonInteraction, EmbedBuilder } from "discord.js";
import { Avatar } from "../../utils/models";
import { Handler } from "../../events/interactionCreate";

export default (async function (interaction, avatars, callback) {
    let message = await interaction.message.fetch(true);

    let avatar = avatars.find(
        (a) =>
            a.get("name") ===
            message.embeds[0].title?.replace("Modification ", "")
    );

    let embed = EmbedBuilder.from(message.embeds[0])
        .setDescription("Envoies un nouveau nom")
        .setColor("#5865F2")
        .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL(),
        })
        .setFooter({
            text: process.env.NAME + " • Modifier l'avatar",
            iconURL: interaction.client.user?.displayAvatarURL(),
        });

    callback({ embeds: [embed] });

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
                name: "Nom",
                value: msg.content,
            },
            {
                name: "Bracket",
                value: avatar?.get("bracket") as string,
            }
        )
        .setTitle("Modifié en " + msg.content);

    await msg.delete();
    await callback({ embeds: [embed] });
} as Handler<ButtonInteraction>);
