import {
    AnySelectMenuInteraction,
    ButtonInteraction,
    EmbedBuilder,
} from "discord.js";
import { Avatar } from "../../utils/models";
import { Handler } from "../../events/interactionCreate";
import avatarSelect from "../selects/avatar";

export default (async function (interaction, avatars, callback) {
    let message = await interaction.message.fetch(true);

    let avatar_id = interaction.customId.split("_").at(-1)!;

    await interaction.followUp({
        content: "Envoies un nouveau bracket incluant le mot 'text'",
        ephemeral: true,
    });

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
            content: "Le bracket doit inclure le mot 'text'",
        });

        setTimeout(() => {
            interaction.deleteReply();
        }, 30000);
    }

    await Avatar.update(
        { bracket: msg.content },
        { where: { userId: interaction.user.id, id: avatar_id } }
    );

    await msg.delete();

    const i = interaction as any as AnySelectMenuInteraction;

    i.values = [avatar_id];

    await avatarSelect(i, avatars, callback);
} as Handler<ButtonInteraction>);
