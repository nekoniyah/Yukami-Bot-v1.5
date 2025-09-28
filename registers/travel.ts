import { SlashCommandBuilder } from "discord.js";

export default new SlashCommandBuilder()
    .setName("travel")
    .setDescription("Voyager entre les différents lieux du serveur RP")
    .setDescriptionLocalizations({
        fr: "Voyager entre les différents lieux du serveur RP",
    });
