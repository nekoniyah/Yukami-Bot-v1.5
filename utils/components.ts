import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Avatar } from "./models";

export async function getButtonSet(avatar_id: string, ...include: string[]) {
    const level = (await Avatar.findByPk(avatar_id))!.get("level") as number;

    // Action buttons
    const editNameButton = new ButtonBuilder()
        .setCustomId(`edit_name_${avatar_id}`)
        .setLabel("✏️ Modifier le nom")
        .setStyle(ButtonStyle.Secondary);

    const editBracketButton = new ButtonBuilder()
        .setCustomId(`edit_bracket_${avatar_id}`)
        .setLabel("🔧 Modifier le bracket")
        .setStyle(ButtonStyle.Secondary);

    const editAvatarButton = new ButtonBuilder()
        .setCustomId(`edit_avatar_url_${avatar_id}`)
        .setLabel("🖼️ Modifier l'image")
        .setStyle(ButtonStyle.Secondary);

    const deleteButton = new ButtonBuilder()
        .setCustomId(`delete_avatar_${avatar_id}`)
        .setLabel("🗑️ Supprimer")
        .setStyle(ButtonStyle.Danger);

    const backButton = new ButtonBuilder()
        .setCustomId("back")
        .setLabel("◀️ Retour")
        .setStyle(ButtonStyle.Primary);

    // Level up button (if applicable)
    const levelUpButton = new ButtonBuilder()
        .setCustomId(`levelup_${avatar_id}`)
        .setLabel("⬆️ Demander un level up")
        .setStyle(ButtonStyle.Success)
        .setDisabled(level >= 100); // Max level cap

    let row1 = new ActionRowBuilder();
    let row2 = new ActionRowBuilder();

    if (include.includes("name")) row1.addComponents(editNameButton);
    if (include.includes("bracket")) row1.addComponents(editBracketButton);
    if (include.includes("avatar")) row1.addComponents(editAvatarButton);
    if (include.includes("delete")) row2.addComponents(deleteButton);
    if (include.includes("levelup")) row2.addComponents(levelUpButton);
    if (include.includes("back")) row2.addComponents(backButton);

    return row1.components.length === 0
        ? [row2.toJSON()]
        : [row1.toJSON(), row2.toJSON()];
}
