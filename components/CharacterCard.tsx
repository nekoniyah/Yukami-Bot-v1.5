import React from 'react';
import s from '../db/stats.json';

interface CharacterCardProps {
    name: string;
    avatarUrl: string;
    species: string;
    level: number;
}


export default {
    element({ name, avatarUrl, species, level }: CharacterCardProps) {
        const stats = s[species as keyof typeof s];

        function scriptStatValue(stat: string) {
            return new Function(`
                const stats = ${JSON.stringify(stats)};
                return ${stat}`)();
        }


        return (
            <div
                style={{
                    width: 800,
                    height: 350,
                    background: 'linear-gradient(135deg, #1f1f2e 0%, #3b3b5c 100%)',
                    borderRadius: 24,
                    display: 'flex',
                    padding: 40,
                    fontFamily: 'Inter',
                    color: '#fff',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                }}
            >
                {/* Avatar */}
                <div style={{ display: 'flex' }}>
                    <img
                        src={avatarUrl}
                        width={200}
                        height={200}
                        style={{
                            borderRadius: '50%',
                            border: '6px solid rgba(255,255,255,0.2)',
                            boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                        }}
                    />
                </div>

                {/* Info */}
                <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 40, justifyContent: 'space-between' }}>
                    {/* Name / Species / Level */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 48, fontWeight: 700, marginBottom: 8 }}>{name}</span>
                        <span style={{ fontSize: 24, fontWeight: 500, opacity: 0.8 }}>
                            {species.charAt(0).toUpperCase() + species.slice(1)} – Level {level}
                        </span>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
                        {Object.entries(stats).map(([statName, statValue]) => (
                            <div key={statName} style={{ display: 'flex' }}>
                                {typeof statValue.base === "string" && <span>{statName.charAt(0).toUpperCase() + statName.slice(1)}: {scriptStatValue(statValue.base)}</span>}
                                {typeof statValue.base !== "string" && <span>{statName.charAt(0).toUpperCase() + statName.slice(1)}: {statValue.base}</span>}

                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    },
    width: 800,
    height: 350,
};
