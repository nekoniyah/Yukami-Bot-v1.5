import React from 'react';
import CharacterCard from './CharacterCard';

export interface CharacterProps {
    name: string;
    avatarUrl: string;
    species: string;
    level: number;
}

interface CharactersProps {
    characters: CharacterProps[];
}


const CARD_HEIGHT = 350;
const CARD_MARGIN = 20;
const CARD_WIDTH = 800;

export default {
    element({ characters }: CharactersProps) {
        const height = characters.length * (CARD_HEIGHT + CARD_MARGIN) + CARD_MARGIN;

        return (
            <div
                style={{
                    width: CARD_WIDTH,
                    height,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingTop: CARD_MARGIN,
                    gap: CARD_MARGIN,
                    background: 'linear-gradient(135deg, #1f1f2e 0%, #3b3b5c 100%)',
                    borderRadius: 24,
                }}
            >
                {characters.map((char, idx) => (
                    <CharacterCard.element key={idx} {...char} />
                ))}
            </div>
        )
    },
    width: CARD_WIDTH,
    height: (CARD_HEIGHT + CARD_MARGIN) + CARD_MARGIN,
}

