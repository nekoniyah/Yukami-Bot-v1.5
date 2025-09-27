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
import { Avatar } from "../utils/models";
import locale from "../locales/locale";
import { renderComponentToPng } from "../utils/render";

export default async function (
    interaction: ChatInputCommandInteraction | ButtonInteraction
) {
    let res = await Avatar.findAll({ where: { userId: interaction.user.id } });

    const loc = await locale(interaction.locale ?? "en");

    let charaReact = await renderComponentToPng("Characters", {
        characters: res.map((a) => ({
            name: a.get("name"),
            avatarUrl: a.get("icon"),
            species: a.get("species"),
            level: a.get("level"),
        })),
    });

    let buffer = await charaReact.arrayBuffer();

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
        .setImage("attachment://characters.png");

    if (res.length === 0) {
        mainEmbed.setDescription(loc.ui.avatars.no_avatars);
        mainEmbed.setImage(null);
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

    const components =
        avatarSelectMenu.options.length > 0
            ? [
                  new ActionRowBuilder()
                      .addComponents(avatarSelectMenu)
                      .toJSON(),
                  new ActionRowBuilder()
                      .addComponents(createAvatarButton)
                      .toJSON(),
              ]
            : [
                  new ActionRowBuilder()
                      .addComponents(createAvatarButton)
                      .toJSON(),
              ];

    if (interaction instanceof ChatInputCommandInteraction) {
        await interaction.editReply({
            embeds: [mainEmbed],
            components,
            files: res.length === 0 ? [] : [Buffer.from(buffer)],
        });
    } else {
        let charaReact = await renderComponentToPng("Characters", {
            characters: res.map((a) => ({
                name: a.get("name"),
                species: a.get("species"),
                level: a.get("level"),
                avatarUrl: a.get("icon"),
            })),
        });

        let buffer = await charaReact.arrayBuffer();

        let message = await interaction.message.fetch(true);
        await message.edit({
            embeds: [mainEmbed],
            components,
            files: res.length === 0 ? [] : [Buffer.from(buffer)],
        });
    }
}
