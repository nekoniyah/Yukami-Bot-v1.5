import { ButtonInteraction } from "discord.js";
import avatarCommand from "../slashs/avatar";
import { type Handler } from "../../events/interactionCreate";

export default (async function backToAvatars(
    interaction: ButtonInteraction,
    avatars,
    callback
) {
    try {
        // Use the main avatar command
        await avatarCommand(interaction, avatars, callback);
    } catch (error) {
        console.error("Error in back navigation:", error);
    }
} as Handler<ButtonInteraction>);
