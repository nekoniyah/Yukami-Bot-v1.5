import { PermissionsBitField, SlashCommandBuilder } from "discord.js";

export default new SlashCommandBuilder()
    .setName("leveling")
    .setDescription("Leveling Commands")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild);
