import { ButtonInteraction } from "discord.js";
import { Avatar } from "../../utils/models";
import avatarCommand from "../slashs/avatar";
import { Handler } from "../../events/interactionCreate";

export default (async function (interaction, avatars, callback) {
    let avatar_id = interaction.customId.split("_").at(-1)!;

    await Avatar.destroy({
        where: { id: avatar_id },
    });

    await avatarCommand(interaction, avatars, callback);
} as Handler<ButtonInteraction>);
