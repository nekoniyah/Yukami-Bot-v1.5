import { Message, TextChannel } from "discord.js";
import { MonsterGenerator } from "../utils/monsters";
import { UserLevelModel } from "../utils/models";
import { renderComponentToPng } from "../utils/render";

// Simple spawn chance (5% per message)
const SPAWN_CHANCE = 20;
const lastSpawn = new Map<string, number>();
const SPAWN_COOLDOWN = 5 * 60 * 1000; // 5 minutes

export default async function handleMonsterSpawn(message: Message) {
    if (message.author.bot) return;

    const now = Date.now();
    const lastChannelSpawn = lastSpawn.get(message.channelId) || 0;

    // Check cooldown and spawn chance
    if (now - lastChannelSpawn < SPAWN_COOLDOWN) return;
    if (Math.random() > SPAWN_CHANCE) return;

    try {
        // Get user level for appropriate monster
        const userLevel = await UserLevelModel.findOne({
            where: { userId: message.author.id },
        });
        const playerLevel = userLevel?.level || 1;

        // Generate monster
        const monster = MonsterGenerator.generateRandomMonster(playerLevel);

        // Render monster card
        const monsterImage = await renderComponentToPng("MonsterCard", {
            monster,
            theme: "dark",
        });

        if (!(message.channel instanceof TextChannel)) return;

        // Send encounter message
        await message.channel.send({
            content: `🎯 **A wild ${monster.name} appears!**\n*Level ${monster.level} ${monster.rarity} ${monster.species}*`,
            files: [
                {
                    attachment: Buffer.from(await monsterImage.arrayBuffer()),
                    name: "monster.png",
                },
            ],
        });

        lastSpawn.set(message.channelId, now);
    } catch (error) {
        console.error("Monster spawn error:", error);
    }
}
