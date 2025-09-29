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
    })
    .addSubcommand((subcommand) =>
        subcommand
            .setName("select")
            .setDescription("Select an avatar to use")
            .addStringOption(
                (option) =>
                    option
                        .setName("avatar")
                        .setDescription("Choose an avatar from your collection")
                        .setRequired(true)
                        .setAutocomplete(true) // This enables autocomplete
            )
    )
    .addSubcommand((subcommand) =>
        subcommand.setName("list").setDescription("List all your avatars")
    )
    .addSubcommand((subcommand) =>
        subcommand.setName("create").setDescription("Create a new avatar")
    );
