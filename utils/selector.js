const {
  ChatInputCommandInteraction,
  StringSelectMenuBuilder,
  ActionRowBuilder,
} = require("discord.js");
const { CharacterManager } = require("./db");
const { ObjectId } = require("mongodb");

/**
 *
 * @param {ChatInputCommandInteraction} interaction
 */
function selector(interaction, userId) {
  return new Promise(async (resolve, reject) => {
    try {
      let charaapi = new CharacterManager(userId);
      let charas = await charaapi.list();

      let selectmenu = new StringSelectMenuBuilder()
        .setPlaceholder(`${interaction.user.username} makes a selection`)
        .setCustomId("selector");

      for (let chara of charas) {
        selectmenu.addOptions({
          label: chara.name,
          emoji: "🧑",
          value: chara._id.toString(),
        });
      }

      if (selectmenu.options.length === 0) return reject("no-chara");

      let msg = await interaction.editReply({
        components: [new ActionRowBuilder().setComponents(selectmenu)],
      });

      let collector = msg.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id,
      });

      collector.on("collect", (i) => {
        resolve(new ObjectId(i.values[0]));
        collector.stop();
        interaction.editReply({
          components: [],
        });
      });
    } catch {}
  });
}

module.exports = selector;
