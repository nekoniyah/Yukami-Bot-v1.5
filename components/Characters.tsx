// components/Characters.tsx
import React from 'react';
import CharacterCard from './CharacterCard';

export interface CharacterProps {
    name: string;
    avatarUrl: string;
    species: string;
    level: number;
    experience?: number;
    experienceToNext?: number;
}

interface CharactersProps {
    characters: CharacterProps[];
    title?: string;
    subtitle?: string;
    layout?: 'vertical' | 'grid';
    theme?: 'dark' | 'light' | 'cosmic' | 'nature';
    showHeader?: boolean;
}

const CARD_HEIGHT = 400;
const CARD_MARGIN = 25;
const CARD_WIDTH = 900;

export default {
    element({
        characters,
        title = "Character Collection",
        subtitle = "Your avatar roster",
        layout = 'vertical',
        theme = 'dark',
        showHeader = true
    }: CharactersProps) {
        const cardsPerRow = 1;
        const rows = Math.ceil(characters.length / cardsPerRow);

        const containerWidth = CARD_WIDTH + (CARD_MARGIN * 2);
        const headerHeight = showHeader ? 120 : 0;
        const contentHeight = rows * (CARD_HEIGHT + CARD_MARGIN) + CARD_MARGIN;
        const totalHeight = headerHeight + contentHeight;

        const themes = {
            dark: {
                primary: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                text: '#ffffff',
                accent: '#6366f1',
                secondary: 'rgba(255,255,255,0.1)'
            },
            light: {
                primary: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)',
                text: '#1f2937',
                accent: '#3b82f6',
                secondary: 'rgba(0,0,0,0.1)'
            },
            cosmic: {
                primary: 'linear-gradient(135deg, #0c0a1c 0%, #1a0d3d 50%, #2d1b69 100%)',
                text: '#ffffff',
                accent: '#a855f7',
                secondary: 'rgba(147,51,234,0.2)'
            },
            nature: {
                primary: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)',
                text: '#ffffff',
                accent: '#22c55e',
                secondary: 'rgba(34,197,94,0.2)'
            }
        };

        const currentTheme = themes[theme];

        return (
            <div
                style={{
                    width: containerWidth,
                    height: totalHeight,
                    background: currentTheme.primary,
                    borderRadius: 32,
                    padding: CARD_MARGIN,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    color: currentTheme.text,
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Background Pattern */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `radial-gradient(circle at 20% 30%, ${currentTheme.accent}10 0%, transparent 50%),
                                     radial-gradient(circle at 80% 70%, ${currentTheme.accent}15 0%, transparent 50%)`,
                    pointerEvents: 'none'
                }} />

                {/* Header */}
                {showHeader && (
                    <div style={{
                        textAlign: 'center',
                        marginBottom: 40,
                        position: 'relative',
                        zIndex: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}>
                        <h1 style={{
                            fontSize: 48,
                            fontWeight: 800,
                            margin: 0,
                            marginBottom: 8,
                            background: `linear-gradient(45deg, ${currentTheme.text} 0%, ${currentTheme.accent} 100%)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent'
                        }}>
                            {title}
                        </h1>
                        <p style={{
                            fontSize: 18,
                            opacity: 0.7,
                            margin: 0,
                            fontWeight: 500
                        }}>
                            {subtitle}
                        </p>

                        {/* Character Count Badge */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: currentTheme.accent,
                            color: '#ffffff',
                            padding: '8px 16px',
                            borderRadius: 20,
                            fontSize: 14,
                            fontWeight: 600,
                            marginTop: 12
                        }}>
                            {characters.length} Character{characters.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                )}

                {/* Characters Container */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: CARD_MARGIN,
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 3
                }}>
                    {characters.map((char, idx) => (
                        <div key={idx} style={{
                            transform: 'translateZ(0)', // Enable hardware acceleration
                        }}>
                            <CharacterCard.element
                                {...char}
                                theme={theme}
                                showProgress={true}
                            />
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {characters.length === 0 && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 300,
                        opacity: 0.6
                    }}>
                        <div style={{
                            fontSize: 48,
                            marginBottom: 16
                        }}>
                            🎭
                        </div>
                        <h3 style={{
                            fontSize: 24,
                            fontWeight: 600,
                            margin: 0,
                            marginBottom: 8
                        }}>
                            No Characters Yet
                        </h3>
                        <p style={{
                            fontSize: 16,
                            opacity: 0.7,
                            textAlign: 'center',
                            maxWidth: 300
                        }}>
                            Create your first avatar to start your adventure!
                        </p>
                    </div>
                )}
            </div>
        );
    },
    width: CARD_WIDTH + (CARD_MARGIN * 2),
    height: 500, // Dynamic height will be calculated
};