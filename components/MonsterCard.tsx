import React from 'react';
import { Monster } from '../utils/monsters';

interface MonsterCardProps {
    monster: Monster;
    theme?: 'dark' | 'light' | 'cosmic' | 'nature';
    showHealthBar?: boolean;
}

const themes = {
    dark: {
        primary: 'linear-gradient(135deg, #1f1f2e 0%, #3b3b5c 100%)',
        secondary: 'rgba(255,255,255,0.1)',
        text: '#ffffff',
        accent: '#ef4444' // Red for monsters instead of blue
    },
    light: {
        primary: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        secondary: 'rgba(0,0,0,0.1)',
        text: '#1f2937',
        accent: '#dc2626'
    },
    cosmic: {
        primary: 'linear-gradient(135deg, #0f0f23 0%, #1a0b3d 50%, #2d1b69 100%)',
        secondary: 'rgba(147,51,234,0.2)',
        text: '#ffffff',
        accent: '#ef4444'
    },
    nature: {
        primary: 'linear-gradient(135deg, #064e3b 0%, #166534 50%, #365314 100%)',
        secondary: 'rgba(34,197,94,0.2)',
        text: '#ffffff',
        accent: '#ef4444'
    }
};

const rarityColors = {
    common: '#9ca3af',
    uncommon: '#22c55e',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b'
};

const speciesIcons = {
    beast: '🐺',
    undead: '💀',
    elemental: '🔥',
    dragon: '🐉',
    demon: '😈',
    fey: '🧚'
};

export default {
    element({
        monster,
        theme = 'dark',
        showHealthBar = true
    }: MonsterCardProps) {
        const currentTheme = themes[theme];
        const rarityColor = rarityColors[monster.rarity];
        const speciesIcon = speciesIcons[monster.species];
        const healthPercentage = (monster.currentHp / monster.maxHp) * 100;

        const getStatColor = (statName: string) => {
            const colors: Record<string, string> = {
                vitality: '#ef4444',
                attack: '#f97316',
                defense: '#3b82f6',
                dexterity: '#8b5cf6',
                agility: '#10b981',
                mana: '#6366f1'
            };
            return colors[statName] || currentTheme.accent;
        };

        return (
            <div
                style={{
                    width: 900,
                    height: 400,
                    background: currentTheme.primary,
                    borderRadius: 24,
                    display: 'flex',
                    padding: 30,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    color: currentTheme.text,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                    border: `2px solid ${currentTheme.accent}`,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Decorative Elements - Same as CharacterCard */}
                <div style={{
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 150,
                    height: 150,
                    background: `radial-gradient(circle, ${currentTheme.accent}20 0%, transparent 70%)`,
                    borderRadius: '50%'
                }} />

                {/* Left Side - Monster Icon Section */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginRight: 40,
                    width: 260
                }}>
                    {/* Monster Icon Container */}
                    <div style={{
                        display: 'flex',
                        position: 'relative',
                        marginBottom: 20,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {/* Monster Icon "Avatar" */}
                        <div style={{
                            width: 220,
                            height: 220,
                            borderRadius: '50%',
                            border: `4px solid ${currentTheme.accent}`,
                            boxShadow: `0 8px 24px ${currentTheme.accent}40`,
                            background: `linear-gradient(45deg, ${currentTheme.accent}20, ${rarityColor}20)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 80
                        }}>
                            {speciesIcon}
                        </div>

                        {/* Level Badge - Same as CharacterCard */}
                        <div style={{
                            display: 'flex',
                            position: 'absolute',
                            bottom: -5,
                            right: -5,
                            backgroundColor: currentTheme.accent,
                            color: '#ffffff',
                            borderRadius: '50%',
                            width: 60,
                            height: 60,
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                            fontWeight: 700,
                            border: '3px solid rgba(255,255,255,0.2)'
                        }}>
                            {monster.level}
                        </div>
                    </div>

                    {/* Health Bar Section - Similar to progress bar */}
                    {showHealthBar && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: 200
                        }}>
                            {/* Health Bar Container */}
                            <div style={{
                                display: 'flex',
                                width: '100%',
                                height: 8,
                                backgroundColor: currentTheme.secondary,
                                borderRadius: 4,
                                overflow: 'hidden',
                                marginBottom: 8
                            }}>
                                <div style={{
                                    display: 'block',
                                    width: `${healthPercentage}%`,
                                    height: '100%',
                                    background: `linear-gradient(90deg, ${healthPercentage > 60 ? '#22c55e' : healthPercentage > 30 ? '#f59e0b' : '#ef4444'} 0%, ${healthPercentage > 60 ? '#22c55e' : healthPercentage > 30 ? '#f59e0b' : '#ef4444'}80 100%)`,
                                    borderRadius: 4
                                }} />
                            </div>

                            {/* Health Text */}
                            <div style={{
                                display: 'flex',
                                fontSize: 12,
                                opacity: 0.7
                            }}>
                                {monster.currentHp}/{monster.maxHp} HP
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side - Info Section - Same structure as CharacterCard */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    justifyContent: 'space-between'
                }}>
                    {/* Header Info */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <h1 style={{
                                fontSize: 42,
                                fontWeight: 800,
                                margin: 0,
                                marginBottom: 8,
                                background: `linear-gradient(45deg, ${currentTheme.text} 0%, ${currentTheme.accent} 100%)`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent'
                            }}>
                                {monster.name}
                            </h1>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            marginBottom: 20
                        }}>
                            <span style={{
                                fontWeight: 600,
                                opacity: 0.9,
                                backgroundColor: currentTheme.secondary,
                                padding: '6px 12px',
                                borderRadius: 20,
                                fontSize: 16
                            }}>
                                {speciesIcon} {monster.species}
                            </span>
                            <span style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: rarityColor,
                                textTransform: 'uppercase'
                            }}>
                                {monster.rarity}
                            </span>
                            <span style={{
                                fontSize: 16,
                                opacity: 0.7,
                                fontWeight: 500
                            }}>
                                Level {monster.level}
                            </span>
                        </div>
                    </div>

                    {/* Stats Section - Same structure as CharacterCard */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        marginBottom: 20
                    }}>
                        {/* Stats Row 1 */}
                        <div style={{
                            display: 'flex',
                            gap: 15
                        }}>
                            {Object.entries(monster.stats).slice(0, 3).map(([statName, statValue]) => {
                                const statColor = getStatColor(statName);
                                return (
                                    <div key={statName} style={{
                                        display: 'flex',
                                        backgroundColor: currentTheme.secondary,
                                        borderRadius: 12,
                                        padding: 12,
                                        borderLeft: `4px solid ${statColor}`,
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        flex: 1
                                    }}>
                                        <span style={{
                                            fontSize: 11,
                                            opacity: 0.7,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            fontWeight: 600,
                                            marginBottom: 4
                                        }}>
                                            {statName}
                                        </span>
                                        <span style={{
                                            fontSize: 18,
                                            fontWeight: 700,
                                            color: statColor
                                        }}>
                                            {statValue}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Stats Row 2 */}
                        <div style={{
                            display: 'flex',
                            gap: 15
                        }}>
                            {Object.entries(monster.stats).slice(3, 6).map(([statName, statValue]) => {
                                const statColor = getStatColor(statName);
                                return (
                                    <div key={statName} style={{
                                        display: 'flex',
                                        backgroundColor: currentTheme.secondary,
                                        borderRadius: 12,
                                        padding: 12,
                                        borderLeft: `4px solid ${statColor}`,
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        flex: 1
                                    }}>
                                        <span style={{
                                            fontSize: 11,
                                            opacity: 0.7,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            fontWeight: 600,
                                            marginBottom: 4
                                        }}>
                                            {statName}
                                        </span>
                                        <span style={{
                                            fontSize: 18,
                                            fontWeight: 700,
                                            color: statColor
                                        }}>
                                            {statValue}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Abilities Section - Simple flex layout */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <span style={{
                            fontSize: 12,
                            opacity: 0.7,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontWeight: 600,
                            marginBottom: 8
                        }}>
                            Abilities
                        </span>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 6
                        }}>
                            {monster.abilities.map((ability, index) => (
                                <span key={index} style={{
                                    fontSize: 12,
                                    backgroundColor: `${currentTheme.accent}20`,
                                    color: currentTheme.accent,
                                    padding: '4px 8px',
                                    borderRadius: 12,
                                    border: `1px solid ${currentTheme.accent}40`
                                }}>
                                    {ability}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};