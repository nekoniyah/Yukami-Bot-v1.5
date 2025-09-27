import {
    ActionRowBuilder,
    AnySelectMenuInteraction,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} from "discord.js";
import { Avatar } from "../models";

export default async function (interaction: AnySelectMenuInteraction) {
    const mainEmbed = new EmbedBuilder()
        .setTitle("Your Avatars")
        .setDescription("Select an avatar to edit or create a new one.")
        .setColor("#5865F2")
        .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL(),
        })
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({
            text: process.env.NAME ?? "Luo",
            iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setImage("attachment://banner-avatars.png");

    let message = await interaction.message.fetch();

    const editAvatarButton = new ButtonBuilder({
        customId: "editAvatar",
        label: "Edit an Avatar",
        style: ButtonStyle.Primary,
    });

    const backButton = new ButtonBuilder({
        customId: "back",
        label: "Back",
        style: ButtonStyle.Secondary,
    });

    let targetAvatar = (await Avatar.findOne({
        where: { id: parseInt(interaction.values[0]) },
    }))!;

    mainEmbed
        .setDescription(null)
        .setTitle(`${targetAvatar.get("name")}`)
        .setThumbnail(targetAvatar.get("icon") as string)
        .setFields({
            name: "Bracket",
            value: targetAvatar.get("bracket") as string,
        });

    await message.edit({
        embeds: [mainEmbed],
        components: [
            interaction.message.components[0],
            new ActionRowBuilder()
                .addComponents(editAvatarButton, backButton)
                .toJSON(),
        ],
    });

    await interaction.deleteReply();
}
