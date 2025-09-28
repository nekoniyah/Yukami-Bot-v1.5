// Simple Monster Interface
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
    abilities: string[];
    flavorText: string;
}

// Monster Templates
const MONSTER_TEMPLATES = {
    forestWolf: {
        name: "Forest Wolf",
        species: "beast",
        rarity: "common",
        baseStats: {
            vitality: 8,
            attack: 3,
            defense: 2,
            dexterity: 4,
            agility: 6,
            mana: 0,
        },
        abilities: ["Pack Hunt", "Howl"],
        flavorText: "A wild wolf prowling through the forest.",
    },

    fireElemental: {
        name: "Fire Elemental",
        species: "elemental",
        rarity: "uncommon",
        baseStats: {
            vitality: 15,
            attack: 6,
            defense: 3,
            dexterity: 3,
            agility: 8,
            mana: 20,
        },
        abilities: ["Flame Burst", "Burning Aura"],
        flavorText: "A being of pure flame, crackling with fury.",
    },

    shadowDragon: {
        name: "Shadow Dragon",
        species: "dragon",
        rarity: "rare",
        baseStats: {
            vitality: 40,
            attack: 8,
            defense: 10,
            dexterity: 5,
            agility: 6,
            mana: 30,
        },
        abilities: ["Shadow Breath", "Wing Buffet", "Dark Magic"],
        flavorText: "A magnificent dragon wreathed in shadow.",
    },
};

// Simple Monster Generator
export class MonsterGenerator {
    static generateRandomMonster(playerLevel: number): Monster {
        const templates = Object.values(MONSTER_TEMPLATES);
        const template =
            templates[Math.floor(Math.random() * templates.length)];

        const level = Math.max(
            1,
            playerLevel + Math.floor(Math.random() * 3) - 1
        );
        const stats = this.calculateStats(template.baseStats, level);

        return {
            id: `${Date.now()}_${Math.random().toString(36)}`,
            name: template.name,
            species: template.species as "beast" | "undead" | "elemental",
            rarity: template.rarity as "common" | "uncommon" | "rare",
            level,
            currentHp: stats.vitality,
            maxHp: stats.vitality,
            stats,
            abilities: template.abilities,
            flavorText: template.flavorText,
        };
    }

    private static calculateStats(baseStats: any, level: number) {
        const calculated: any = {};
        Object.entries(baseStats).forEach(([stat, base]) => {
            calculated[stat] = Math.floor(
                (base as number) * (1 + (level - 1) * 0.15)
            );
        });
        return calculated;
    }
}
