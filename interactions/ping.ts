import { TypicalInteractionFn } from "../eventBuilder";

const ping: TypicalInteractionFn = async (interaction, { now }) => {
    await interaction.reply(`:ping_pong: Pong! ${Date.now() - now}ms`);
};

export default ping;
