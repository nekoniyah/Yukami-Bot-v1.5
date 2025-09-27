import { ChatInputCommandInteraction } from "discord.js";
import { renderComponentToPng } from "../utils/render";

const ping = async (interaction: ChatInputCommandInteraction, now: number) => {
    await interaction.editReply(`:ping_pong: Pong! ${Date.now() - now}ms`);

    // let img = await renderComponentToPng("PrettyProfileCard", {
    //     username: interaction.user.username,
    //     avatarUrl: interaction.user.displayAvatarURL({ extension: "png" }),
    //     tagline: "Pong! " + (Date.now() - now) + "ms",
    // });

    // let buffer = await img.arrayBuffer();

    // await interaction.editReply({ files: [Buffer.from(buffer)] });
};

export default ping;
