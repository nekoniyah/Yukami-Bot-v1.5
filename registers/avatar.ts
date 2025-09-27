import { SlashCommandBuilder } from "discord.js";
import locale from "../locales/locale";

export default new SlashCommandBuilder()
    .setName("avatar")
    .setNameLocalizations({
        "en-US": (await locale("en")).slash.avatar.name,
        fr: (await locale("fr")).slash.avatar.name,
    })
    .setDescription((await locale("en")).slash.avatar.description)
    .setDescriptionLocalizations({
        "en-US": (await locale("en")).slash.avatar.description,
        fr: (await locale("fr")).slash.avatar.description,
    });
