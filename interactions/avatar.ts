import {
    ActionRowBuilder,
    Attachment,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    StringSelectMenuBuilder,
} from "discord.js";
import path from "path";
import { Avatar } from "../models";
import locale from "../locales/locale";

export default async function (
    interaction: ChatInputCommandInteraction | ButtonInteraction
) {
    let res = await Avatar.findAll({ where: { userId: interaction.user.id } });

    const loc = await locale(interaction.locale ?? "en");

    const mainEmbed = new EmbedBuilder()
        .setTitle(loc.ui.avatars.title)
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

    if (res.length === 0) {
        mainEmbed.setDescription(loc.ui.avatars.no_avatars);
    }

    const createAvatarButton = new ButtonBuilder({
        customId: "createAvatar",
        label: loc.ui.avatars.create_label,
        style: ButtonStyle.Primary,
    });

    const avatarSelectMenu = new StringSelectMenuBuilder()
        .setCustomId("avatarSelect")
        .setPlaceholder("Select an avatar to edit");

    for (let avatar of res) {
        avatarSelectMenu.addOptions({
            label: avatar.get("name") as string,
            value: `${avatar.get("id") as string}`,
        });
    }

    const components = [
        new ActionRowBuilder().addComponents(avatarSelectMenu).toJSON(),
        new ActionRowBuilder().addComponents(createAvatarButton).toJSON(),
    ];

    if (res.length === 0) {
        components.slice(0, 1);
    }

    if (interaction instanceof ChatInputCommandInteraction) {
        await interaction.editReply({
            embeds: [mainEmbed],
            components,
            files: [
                new AttachmentBuilder(
                    path.join(__dirname, "..", "assets", "banner-avatars.png"),
                    { name: "banner-avatars.png" }
                ),
            ],
        });
    } else {
        let message = await interaction.message.fetch(true);
        await message.edit({
            embeds: [mainEmbed],
            components,
        });
    }
}
