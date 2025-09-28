import { Message, TextChannel } from "discord.js";
import { UserLevelModel } from "./models";
import { renderComponentToPng } from "./render";

// Simplified Monster Interface
export interface Monster {
    id: string;
    name: string;
    species: "beast" | "undead" | "elemental" | "dragon" | "demon" | "fey";
    rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
    level: number;
    currentHp: number;
    maxHp: number;
    stats: {
        vitality: number;
        attack: number;
        defense: number;
        dexterity: number;
        agility: number;
        mana: number;
    };
}

// French name generation data
const NAME_PARTS = {
    beast: {
        prefixes: [
            "Sombre",
            "Sauvage",
            "Fer",
            "Sang",
            "Tempête",
            "Ancien",
            "Féroce",
            "Obscur",
        ],
        suffixes: [
            "croc",
            "griffe",
            "hurlement",
            "coureur",
            "traqueur",
            "chasseur",
            "rôdeur",
            "bête",
        ],
    },
    undead: {
        prefixes: [
            "Maudit",
            "Os",
            "Tombe",
            "Mort",
            "Âme",
            "Fantôme",
            "Spectre",
            "Perdu",
        ],
        suffixes: [
            "marcheur",
            "ombre",
            "esprit",
            "spectre",
            "crâne",
            "ossements",
            "fantôme",
            "revenant",
        ],
    },
    elemental: {
        prefixes: [
            "Brûlant",
            "Givre",
            "Orage",
            "Terre",
            "Vide",
            "Cristal",
            "Fondu",
            "Azur",
        ],
        suffixes: [
            "flamme",
            "éclat",
            "déferlante",
            "cœur",
            "essence",
            "esprit",
            "force",
            "gardien",
        ],
    },
    dragon: {
        prefixes: [
            "Antique",
            "Wyrm",
            "Ancien",
            "Puissant",
            "Écaillé",
            "Aile",
            "Feu",
            "Glace",
        ],
        suffixes: [
            "aile",
            "écaille",
            "souffle",
            "griffe",
            "rugissement",
            "seigneur",
            "roi",
            "terreur",
        ],
    },
    demon: {
        prefixes: [
            "Infernal",
            "Maudit",
            "Enfer",
            "Sombre",
            "Vide",
            "Chaos",
            "Tourment",
            "Colère",
        ],
        suffixes: [
            "fléau",
            "perdition",
            "fureur",
            "corne",
            "croc",
            "terreur",
            "dépit",
            "ombre",
        ],
    },
    fey: {
        prefixes: [
            "Mystique",
            "Lune",
            "Étoile",
            "Rêve",
            "Épine",
            "Pétale",
            "Soie",
            "Rosée",
        ],
        suffixes: [
            "aile",
            "danse",
            "chanson",
            "murmure",
            "floraison",
            "chatoiement",
            "lueur",
            "sprite",
        ],
    },
};

// Rarity configuration
const RARITY_CONFIG = {
    common: { multiplier: 1.0, spawnChance: 60, displayName: "Commun" },
    uncommon: { multiplier: 1.3, spawnChance: 25, displayName: "Peu commun" },
    rare: { multiplier: 1.7, spawnChance: 10, displayName: "Rare" },
    epic: { multiplier: 2.2, spawnChance: 4, displayName: "Épique" },
    legendary: { multiplier: 3.0, spawnChance: 1, displayName: "Légendaire" },
};

// Base stats by species
const SPECIES_BASE_STATS = {
    beast: {
        vitality: 12,
        attack: 8,
        defense: 6,
        dexterity: 10,
        agility: 12,
        mana: 2,
    },
    undead: {
        vitality: 14,
        attack: 6,
        defense: 8,
        dexterity: 4,
        agility: 6,
        mana: 8,
    },
    elemental: {
        vitality: 10,
        attack: 10,
        defense: 4,
        dexterity: 6,
        agility: 8,
        mana: 16,
    },
    dragon: {
        vitality: 20,
        attack: 14,
        defense: 12,
        dexterity: 8,
        agility: 6,
        mana: 12,
    },
    demon: {
        vitality: 16,
        attack: 12,
        defense: 8,
        dexterity: 10,
        agility: 10,
        mana: 10,
    },
    fey: {
        vitality: 8,
        attack: 6,
        defense: 4,
        dexterity: 14,
        agility: 16,
        mana: 14,
    },
};

// Species display names in French
const SPECIES_DISPLAY_NAMES = {
    beast: "Bête",
    undead: "Mort-vivant",
    elemental: "Élémentaire",
    dragon: "Dragon",
    demon: "Démon",
    fey: "Fée",
};

/**
 * Complete Monster Encounter System - Simplified
 */
export class MonsterEncounterSystem {
    private static lastSpawn = new Map<string, number>();
    private static readonly SPAWN_COOLDOWN = parseInt(
        process.env.MONSTER_SPAWN_COOLDOWN || "300000"
    );
    private static readonly SPAWN_CHANCE =
        parseInt(process.env.MONSTER_SPAWN_CHANCE || "20") / 100;

    /**
     * Main message handler for monster spawning
     */
    static async handleMessageSpawn(message: Message): Promise<void> {
        if (message.author.bot || !(message.channel instanceof TextChannel))
            return;

        const now = Date.now();
        const lastChannelSpawn = this.lastSpawn.get(message.channelId) || 0;

        // Check cooldown and spawn chance
        if (now - lastChannelSpawn < this.SPAWN_COOLDOWN) return;
        if (Math.random() > this.SPAWN_CHANCE) return;

        try {
            // Get user level for appropriate monster scaling
            const userLevel = await UserLevelModel.findOne({
                where: { userId: message.author.id },
            });
            const playerLevel = userLevel?.level || 1;

            // Generate random monster
            const monster = this.generateRandomMonster(playerLevel);

            // Spawn the monster
            await this.spawnMonster(message.channel, monster);
            this.lastSpawn.set(message.channelId, now);
        } catch (error) {
            console.error("Erreur lors de l'apparition de monstre:", error);
        }
    }

    /**
     * Generate completely random monster
     */
    static generateRandomMonster(playerLevel: number): Monster {
        const species = this.getRandomSpecies();
        const rarity = this.getRandomRarity();
        const level = Math.max(
            1,
            playerLevel + Math.floor(Math.random() * 3) - 1
        );
        const name = this.generateRandomName(species);
        const stats = this.calculateStats(species, rarity, level);

        return {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            species,
            rarity,
            level,
            currentHp: stats.vitality,
            maxHp: stats.vitality,
            stats,
        };
    }

    /**
     * Generate random French name
     */
    private static generateRandomName(species: Monster["species"]): string {
        const parts = NAME_PARTS[species];
        const prefix =
            parts.prefixes[Math.floor(Math.random() * parts.prefixes.length)];
        const suffix =
            parts.suffixes[Math.floor(Math.random() * parts.suffixes.length)];
        return `${prefix} ${suffix}`;
    }

    /**
     * Get random species
     */
    private static getRandomSpecies(): Monster["species"] {
        const species: Monster["species"][] = [
            "beast",
            "undead",
            "elemental",
            "dragon",
            "demon",
            "fey",
        ];
        return species[Math.floor(Math.random() * species.length)];
    }

    /**
     * Get weighted random rarity
     */
    private static getRandomRarity(): Monster["rarity"] {
        const rand = Math.random() * 100;
        let cumulative = 0;

        for (const [rarity, config] of Object.entries(RARITY_CONFIG)) {
            cumulative += config.spawnChance;
            if (rand <= cumulative) {
                return rarity as Monster["rarity"];
            }
        }
        return "common";
    }

    /**
     * Calculate stats with random variation
     */
    private static calculateStats(
        species: Monster["species"],
        rarity: Monster["rarity"],
        level: number
    ): Monster["stats"] {
        const baseStats = SPECIES_BASE_STATS[species];
        const rarityMultiplier = RARITY_CONFIG[rarity].multiplier;
        const levelMultiplier = 1 + (level - 1) * 0.15;

        const stats: Monster["stats"] = {} as Monster["stats"];

        Object.entries(baseStats).forEach(([stat, base]) => {
            // Add random variation (±10% for uniqueness)
            const variation = 0.9 + Math.random() * 0.2;
            const value = Math.floor(
                base * rarityMultiplier * levelMultiplier * variation
            );
            stats[stat as keyof Monster["stats"]] = Math.max(1, value);
        });

        return stats;
    }

    /**
     * Spawn monster in channel with visual card
     */
    private static async spawnMonster(
        channel: TextChannel,
        monster: Monster
    ): Promise<void> {
        try {
            // Render monster card
            const monsterImage = await renderComponentToPng("MonsterCard", {
                monster,
                theme: "dark",
            });

            // Create simple encounter message
            const rarityDisplay = RARITY_CONFIG[monster.rarity].displayName;
            const speciesDisplay = SPECIES_DISPLAY_NAMES[monster.species];

            const encounterMessage = `🎯 **Un ${monster.name} sauvage apparaît !**\n*Niveau ${monster.level} • ${rarityDisplay} ${speciesDisplay}*`;

            // Send encounter with image
            await channel.send({
                content: encounterMessage,
                files: [
                    {
                        attachment: Buffer.from(
                            await monsterImage.arrayBuffer()
                        ),
                        name: "monster.png",
                    },
                ],
            });
        } catch (error) {
            console.error("Erreur lors de l'affichage du monstre:", error);

            // Fallback text-only message
            const rarityDisplay = RARITY_CONFIG[monster.rarity].displayName;
            const speciesDisplay = SPECIES_DISPLAY_NAMES[monster.species];
            await channel.send(
                `🎯 **Un ${monster.name} apparaît !** (Niveau ${monster.level} • ${rarityDisplay} ${speciesDisplay})`
            );
        }
    }

    /**
     * Get monster info for display
     */
    static getMonsterInfo(monster: Monster): string {
        const rarityDisplay = RARITY_CONFIG[monster.rarity].displayName;
        const speciesDisplay = SPECIES_DISPLAY_NAMES[monster.species];

        return `**${monster.name}**\nNiveau ${monster.level} • ${rarityDisplay} ${speciesDisplay}\nPV: ${monster.currentHp}/${monster.maxHp}`;
    }

    /**
     * Admin command to force spawn
     */
    static async forceSpawn(
        channel: TextChannel,
        level?: number
    ): Promise<void> {
        const monster = this.generateRandomMonster(level || 1);
        await this.spawnMonster(channel, monster);
    }
}
