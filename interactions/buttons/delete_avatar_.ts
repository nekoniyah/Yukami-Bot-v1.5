import { ButtonInteraction } from "discord.js";
import { Avatar } from "../../utils/models";
import avatarCommand from "../avatar/avatar";

export default async function (interaction: ButtonInteraction) {
    await interaction.deleteReply();

    let avatar_id = interaction.customId.split("_").at(-1)!;

    await Avatar.destroy({
        where: { id: avatar_id },
    });

    await avatarCommand(interaction);
}
