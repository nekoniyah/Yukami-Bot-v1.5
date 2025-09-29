import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
} from "discord.js";
import { Avatar } from "../../utils/models";
import locale from "../../locales/locale";

export default async function (interaction: ButtonInteraction) {
    let message = await interaction.message.fetch(true);

    if (interaction.user.id !== message.interactionMetadata!.user.id) {
        await interaction.editReply({
            content: "You cannot edit this message.",
        });
        return;
    }

    await interaction.deleteReply();

    const name = message.embeds[0].title!;
    const ownedOne = await Avatar.findOne({
        where: { userId: interaction.user.id, name },
    });

    const loc = await locale(interaction.locale ?? "en");

    if (!ownedOne) {
        let errorEmbed = new EmbedBuilder()
            .setTitle("Error")
            .setColor("#E74C3C")
            .setTimestamp()
            .setFooter({
                text: process.env.NAME + " • Error",
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setDescription(loc.ui.avatars.not_owner);
        await message.reply({ embeds: [errorEmbed] });
        return;
    }

    let embed = EmbedBuilder.from(message.embeds[0])
        .setTitle(loc.ui.avatars.editing_title.replace("%s", name))
        .setColor("#5865F2")
        .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL(),
        })
        .setFields(
            { name: "Name", value: name, inline: true },
            {
                name: "Bracket",
                value: ownedOne.get("bracket") as string,
                inline: true,
            }
        )
        .setImage("attachment://banner-avatars.png");

    const backButton = new ButtonBuilder({
        customId: "back",
        label: "Back",
        style: ButtonStyle.Secondary,
    });

    const editNameButton = new ButtonBuilder({
        customId: "edit_name",
        label: "Edit Name",
        style: ButtonStyle.Primary,
    });

    const editBracketButton = new ButtonBuilder({
        customId: "edit_bracket",
        label: "Edit Bracket",
        style: ButtonStyle.Primary,
    });

    const editAvatarUrlButton = new ButtonBuilder({
        customId: "edit_avatar_url",
        label: "Edit Avatar URL",
        style: ButtonStyle.Primary,
    });

    await message.edit({
        embeds: [embed],
        components: [
            new ActionRowBuilder().addComponents(backButton).toJSON(),
            new ActionRowBuilder()
                .addComponents(
                    editNameButton,
                    editBracketButton,
                    editAvatarUrlButton
                )
                .toJSON(),
        ],
    });
}
