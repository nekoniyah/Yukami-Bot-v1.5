import { ChatInputCommandInteraction } from "discord.js";
import { TypicalInteractionFn } from "../eventBuilder";

const ping = async (interaction: ChatInputCommandInteraction, now: number) => {
    await interaction.editReply(`:ping_pong: Pong! ${Date.now() - now}ms`);
};

export default ping;
