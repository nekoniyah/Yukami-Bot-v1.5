import {
    ActionRowBuilder,
    AnySelectMenuInteraction,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
} from "discord.js";
import { ReactionRole } from "../models";
import locale from "../locales/locale";

export default async function (interaction: AnySelectMenuInteraction) {
    let rr = await ReactionRole.findOne({
        where: { id: interaction.values[0] },
    });
    const loc = await locale(interaction.locale ?? "en");

    const embed = new EmbedBuilder()
        .setTitle(loc.ui.reaction_roles.remove_title)
        .setColor("#E74C3C")
        .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp()
        .setThumbnail(
            interaction.guild?.iconURL() ??
                interaction.client.user.displayAvatarURL()
        )
        .setFooter({
            text: `${loc.ui.generic.footer_brand} • Reaction Roles`,
            iconURL: interaction.client.user.displayAvatarURL(),
        });

    let delete_btn = new ButtonBuilder()
        .setCustomId("delete_btn_rr")
        .setLabel("Delete")
        .setStyle(ButtonStyle.Danger);

    await interaction.deleteReply();

    let message = await interaction.message.fetch(true);

    let m = await message.edit({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(delete_btn).toJSON()],
    });

    const res = await m.awaitMessageComponent({
        filter: (i) => i.user.id === interaction.user.id,
        componentType: ComponentType.Button,
        time: 30000,
    });

    if (!res) return;

    await rr?.destroy();

    embed
        .setTitle("Deleted!")
        .setDescription(loc.ui.reaction_roles.deleted)
        .setColor("#2ECC71");

    await m.edit({
        embeds: [embed],
        components: [],
    });
}
