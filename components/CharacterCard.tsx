// components/CharacterCard.tsx
import React from 'react';
import s from '../db/stats.json';
import displays from '../db/displays.json';

interface CharacterCardProps {
    name: string;
    avatarUrl: string;
    species: string;
    level: number;
    experience?: number;
    experienceToNext?: number;
    theme?: 'dark' | 'light' | 'cosmic' | 'nature';
    showProgress?: boolean;
}

const themes = {
    dark: {
        primary: 'linear-gradient(135deg, #1f1f2e 0%, #3b3b5c 100%)',
        secondary: 'rgba(255,255,255,0.1)',
        text: '#ffffff',
        accent: '#6366f1'
    },
    light: {
        primary: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        secondary: 'rgba(0,0,0,0.1)',
        text: '#1f2937',
        accent: '#3b82f6'
    },
    cosmic: {
        primary: 'linear-gradient(135deg, #0f0f23 0%, #1a0b3d 50%, #2d1b69 100%)',
        secondary: 'rgba(147,51,234,0.2)',
        text: '#ffffff',
        accent: '#a855f7'
    },
    nature: {
        primary: 'linear-gradient(135deg, #064e3b 0%, #166534 50%, #365314 100%)',
        secondary: 'rgba(34,197,94,0.2)',
        text: '#ffffff',
        accent: '#22c55e'
    }
};

export default {
    element({
        name,
        avatarUrl,
        species,
        level,
        experience = 0,
        experienceToNext = 100,
        theme = 'dark',
        showProgress = true
    }: CharacterCardProps) {
        const stats = s[species as keyof typeof s];
        const currentTheme = themes[theme];
        const speciesDisplay = displays[species as keyof typeof displays] || species;

        // Calculate stat values
        function calculateStat(stat: any) {
            if (typeof stat.base === 'string') {
                // For dynamic stats like felinid
                return new Function(`
                    const level = ${level};
                    const stats = ${JSON.stringify(stats)}; // Mock for calculation
                    return ${stat.base};
                `)();
            }
            return Math.floor(stat.base + (stat.perLevel * (level - 1)));
        }

        // Calculate experience percentage
        const expPercentage = (experience / experienceToNext) * 100;

        // Get stat colors
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
                    border: `2px solid ${currentTheme.secondary}`,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Decorative Elements */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 150,
                    height: 150,
                    background: `radial-gradient(circle, ${currentTheme.accent}20 0%, transparent 70%)`,
                    borderRadius: '50%'
                }} />

                {/* Avatar Section */}
                <div style={{
                    display: 'contents',
                    alignItems: 'center',
                    marginRight: 40
                }}>
                    <div style={{
                        position: 'relative',
                        marginBottom: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'

                    }}>
                        <img
                            src={avatarUrl}
                            width={220}
                            height={220}
                            style={{
                                borderRadius: '50%',
                                border: `4px solid ${currentTheme.accent}`,
                                boxShadow: `0 8px 24px ${currentTheme.accent}40`,
                            }}
                        />
                        {/* Level Badge */}
                        <div style={{
                            position: 'absolute',
                            bottom: -5,
                            right: -5,
                            backgroundColor: currentTheme.accent,
                            color: '#ffffff',
                            borderRadius: '50%',
                            width: 60,
                            height: 60,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                            fontWeight: 700,
                            border: '3px solid rgba(255,255,255,0.2)'
                        }}>
                            {level}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {showProgress && (
                        <div style={{
                            width: 200,
                            height: 8,
                            backgroundColor: currentTheme.secondary,
                            borderRadius: 4,
                            overflow: 'hidden',
                            display: 'contents'
                        }}>
                            <div style={{
                                width: `${expPercentage}%`,
                                height: '100%',
                                background: `linear-gradient(90deg, ${currentTheme.accent} 0%, ${currentTheme.accent}80 100%)`,
                                borderRadius: 4,
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                    )}

                    {showProgress && (
                        <div style={{
                            fontSize: 12,
                            opacity: 0.7,
                            marginTop: 5,
                            display: 'contents'
                        }}>
                            <span>{experience}/{experienceToNext} EXP</span>
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div style={{
                    display: 'contents',
                    flex: 1,
                    justifyContent: 'space-between'
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'contents'
                    }}>
                        <h1 style={{
                            fontSize: 42,
                            fontWeight: 800,
                            margin: 0,
                            marginBottom: 8,
                            background: `linear-gradient(45deg, ${currentTheme.text} 0%, ${currentTheme.accent} 100%)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            display: 'contents'
                        }}>
                            {name}
                        </h1>
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
                                {speciesDisplay}
                            </span>
                            <span style={{
                                fontSize: 16,
                                opacity: 0.7,
                                fontWeight: 500
                            }}>
                                Level {level}
                            </span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div style={{
                        display: "contents",
                        gap: 15,
                        marginBottom: 20
                    }}>
                        {Object.entries(stats).map(([statName, statValue]) => {
                            const calculatedValue = calculateStat(statValue);
                            const statColor = getStatColor(statName);

                            return (
                                <div key={statName} style={{
                                    backgroundColor: currentTheme.secondary,
                                    borderRadius: 12,
                                    padding: 12,
                                    borderLeft: `4px solid ${statColor}`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 4
                                }}>
                                    <span style={{
                                        fontSize: 12,
                                        opacity: 0.7,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        fontWeight: 600
                                    }}>
                                        {statName}
                                    </span>
                                    <span style={{
                                        fontSize: 20,
                                        fontWeight: 700,
                                        color: statColor
                                    }}>
                                        {calculatedValue}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer Info */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 12,
                        opacity: 0.6
                    }}>
                        <span>Created with Yukami Bot</span>
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        );
    },
    width: 900,
    height: 400,
};