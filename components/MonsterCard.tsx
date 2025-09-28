import React from "react";

interface MonsterCardProps {
    monster: {
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
    };
    theme?: "light" | "dark";
}

const RARITY_COLORS = {
    common: "#9CA3AF",      // Gray
    uncommon: "#10B981",    // Green
    rare: "#3B82F6",        // Blue
    epic: "#A855F7",        // Purple
    legendary: "#F59E0B"    // Orange
};

const SPECIES_DISPLAY_NAMES = {
    beast: "Bête",
    undead: "Mort-vivant",
    elemental: "Élémentaire",
    dragon: "Dragon",
    demon: "Démon",
    fey: "Fée"
};

const RARITY_DISPLAY_NAMES = {
    common: "Commun",
    uncommon: "Peu commun",
    rare: "Rare",
    epic: "Épique",
    legendary: "Légendaire"
};

export default {
    element: function MonsterCard({ monster, theme = "dark" }: MonsterCardProps) {
        const isDark = theme === "dark";
        const rarityColor = RARITY_COLORS[monster.rarity];
        const speciesName = SPECIES_DISPLAY_NAMES[monster.species];
        const rarityName = RARITY_DISPLAY_NAMES[monster.rarity];

        return (
            <div
                style={{
                    width: 420,
                    height: 280,
                    backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                    border: `3px solid ${rarityColor}`,
                    borderRadius: 16,
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    color: isDark ? "#FFFFFF" : "#111827",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    boxShadow: isDark ? "0 10px 25px rgba(0, 0, 0, 0.5)" : "0 10px 25px rgba(0, 0, 0, 0.1)",
                }}
            >
                {/* Header */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 20
                }}>
                    <div style={{ flex: 1 }}>
                        <h1 style={{
                            fontSize: 22,
                            fontWeight: "800",
                            margin: 0,
                            color: rarityColor,
                            lineHeight: 1.1,
                            textShadow: isDark ? "0 2px 4px rgba(0, 0, 0, 0.3)" : "none"
                        }}>
                            {monster.name}
                        </h1>
                        <div style={{
                            fontSize: 14,
                            color: isDark ? "#9CA3AF" : "#6B7280",
                            marginTop: 4,
                            fontWeight: "500"
                        }}>
                            {speciesName} • {rarityName}
                        </div>
                    </div>
                    <div style={{
                        textAlign: "right",
                        backgroundColor: rarityColor,
                        color: "#FFFFFF",
                        padding: "8px 12px",
                        borderRadius: 8,
                        fontSize: 16,
                        fontWeight: "700"
                    }}>
                        Niv. {monster.level}
                    </div>
                </div>

                {/* HP Section */}
                <div style={{ marginBottom: 20 }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 14,
                        fontWeight: "600",
                        marginBottom: 6,
                        color: isDark ? "#D1D5DB" : "#374151"
                    }}>
                        <span>Points de Vie</span>
                        <span>{monster.currentHp} / {monster.maxHp}</span>
                    </div>
                    <div
                        style={{
                            width: "100%",
                            height: 10,
                            backgroundColor: isDark ? "#374151" : "#E5E7EB",
                            borderRadius: 5,
                            overflow: "hidden"
                        }}
                    >
                        <div
                            style={{
                                width: `${Math.max(0, (monster.currentHp / monster.maxHp) * 100)}%`,
                                height: "100%",
                                backgroundColor: monster.currentHp > monster.maxHp * 0.6
                                    ? "#10B981"
                                    : monster.currentHp > monster.maxHp * 0.3
                                        ? "#F59E0B"
                                        : "#EF4444",
                                borderRadius: 5,
                                transition: "width 0.3s ease"
                            }}
                        />
                    </div>
                </div>

                {/* Stats Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 16,
                        flex: 1
                    }}
                >
                    <StatItem
                        label="VIT"
                        value={monster.stats.vitality}
                        color="#EF4444"
                        isDark={isDark}
                    />
                    <StatItem
                        label="ATT"
                        value={monster.stats.attack}
                        color="#F59E0B"
                        isDark={isDark}
                    />
                    <StatItem
                        label="DEF"
                        value={monster.stats.defense}
                        color="#10B981"
                        isDark={isDark}
                    />
                    <StatItem
                        label="DEX"
                        value={monster.stats.dexterity}
                        color="#3B82F6"
                        isDark={isDark}
                    />
                    <StatItem
                        label="AGI"
                        value={monster.stats.agility}
                        color="#8B5CF6"
                        isDark={isDark}
                    />
                    <StatItem
                        label="MANA"
                        value={monster.stats.mana}
                        color="#06B6D4"
                        isDark={isDark}
                    />
                </div>
            </div>
        )
    }, width: 900,
    height: 400,
}

function StatItem({
    label,
    value,
    color,
    isDark
}: {
    label: string;
    value: number;
    color: string;
    isDark: boolean;
}) {
    return (
        <div style={{
            textAlign: "center",
            backgroundColor: isDark ? "#374151" : "#F9FAFB",
            borderRadius: 8,
            padding: "12px 8px",
            border: `2px solid ${color}20`
        }}>
            <div style={{
                fontSize: 11,
                fontWeight: "600",
                color: isDark ? "#9CA3AF" : "#6B7280",
                marginBottom: 4,
                letterSpacing: "0.5px"
            }}>
                {label}
            </div>
            <div style={{
                fontSize: 20,
                fontWeight: "800",
                color: color,
                lineHeight: 1
            }}>
                {value}
            </div>
        </div>
    );
}