# 🎭 Yukami Bot v1.5

<div align="center">

[![Discord.js](https://img.shields.io/badge/Discord.js-v14.21.0-blue.svg)](https://discord.js.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Runtime-Bun-orange.svg)](https://bun.sh/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-green.svg)](https://www.sqlite.org/)

_A feature-rich Discord bot for roleplay communities with avatar management, leveling, and interactive systems_

</div>

## 🌟 Features

### 🎭 Avatar Roleplay System

-   **Multiple Characters**: Users can create and manage multiple roleplay avatars
-   **Species System**: 6 different species (Human, Elf, Dragon, Angel, Faunid, Félinade Empyréenne) with unique stat progressions
-   **Dynamic Stats**: Level-based stat calculations for vitality, attack, defense, dexterity, agility, and mana
-   **Visual Character Cards**: Auto-generated character images using React components
-   **Character Management**: Create, edit, delete, and switch between avatars
-   **Bracket System**: Customizable message formatting for roleplay

### 📈 Leveling System

-   **User Progression**: Experience and level tracking for users
-   **Character Levels**: Individual leveling for each avatar
-   **Quest Integration**: Quest system with progress tracking and rewards
-   **Leaderboards**: Level-based ranking system

### 👋 Welcome & Moderation

-   **Custom Welcome Messages**: Configurable welcome messages for new members
-   **Auto-Role Assignment**: Automatic role assignment for users and bots
-   **Guild-Specific Configuration**: Per-server welcome settings

### ⚡ Reaction Roles

-   **Interactive Role Management**: Users can assign/remove roles via emoji reactions
-   **Multiple Roles per Emoji**: Support for assigning multiple roles with one reaction
-   **Guild Integration**: Server-specific reaction role configurations

### 🐉 Monster System (Basic Implementation)

-   **Random Encounters**: Monsters spawn during chat activity (5% chance, 5-minute cooldown)
-   **Level-Appropriate**: Monster levels scale with player progression
-   **Visual Monster Cards**: Generated monster images with stats display
-   **Multiple Species**: Beast, Elemental, Dragon, Undead, Demon, Fey monsters
-   **Rarity System**: Common, Uncommon, Rare, Epic, Legendary monsters

### 🌐 Internationalization

-   **Multi-Language Support**: English, French, German, Spanish, Portuguese
-   **Locale Detection**: Automatic language detection from user settings
-   **Extensible Translation System**: Easy to add new languages

### 🎨 Visual Components

-   **React-Based Rendering**: Server-side React components for image generation
-   **Character Galleries**: Visual display of multiple characters
-   **Monster Cards**: Detailed monster information cards
-   **Theme Support**: Dark/light theme options
-   **Performance Optimized**: Cached rendering with TTL

## 🛠️ Tech Stack

-   **Runtime**: Bun (High-performance JavaScript runtime)
-   **Framework**: Discord.js v14
-   **Language**: TypeScript
-   **Database**: SQLite with Sequelize ORM
-   **Image Generation**: @vercel/og + Satori + React
-   **Environment**: dotenv for configuration

## 📦 Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/nekoniyah/yukami-bot-v1.5.git
    cd yukami-bot-v1.5
    ```

2. **Install dependencies**

    ```bash
    bun install
    ```

3. **Configure environment**

    ```bash
    cp .env.example .env
    # Edit .env with your Discord bot token and other settings
    ```

4. **Run the bot**
    ```bash
    bun start
    ```

## ⚙️ Configuration

Create a `.env` file with the following variables:

```env
# Discord Bot Configuration
TOKEN=your_discord_bot_token_here
NAME=Yukami Bot

# Database Configuration
DATABASE_URL=./db/database.db

# Environment
NODE_ENV=production

# Optional: Performance Settings
CACHE_TTL=300000
MAX_AVATARS_PER_USER=10
```

## 📁 Project Structure

```
yukami-bot-v1.5/
├── components/          # React components for image generation
│   ├── CharacterCard.tsx
│   ├── Characters.tsx
│   └── MonsterCard.tsx
├── db/                  # Database configuration and data
│   ├── displays.json    # Species display names
│   └── stats.json       # Species stat configurations
├── events/              # Discord event handlers
│   ├── clientReady.ts
│   ├── guildMemberAdd.ts
│   ├── interactionCreate.ts
│   ├── messageCreate.ts
│   ├── messageReactionAdd.ts
│   ├── messageReactionRemove.ts
│   └── monsterSpawn.ts
├── interactions/        # Slash command and button handlers
│   ├── avatar.ts
│   ├── createAvatar.ts
│   ├── editAvatar.ts
│   ├── welcome.ts
│   └── rr.ts
├── locales/            # Internationalization files
│   ├── en.json
│   ├── fr.json
│   ├── de.json
│   ├── es.json
│   ├── pt.json
│   └── locale.ts
├── registers/          # Command registration
├── utils/              # Utility functions
│   ├── db.ts
│   ├── models.ts
│   ├── monsters.ts
│   └── render.tsx
└── index.ts            # Main bot entry point
```

## 🚀 Commands

-   `/avatar` - Manage your roleplay avatars
-   `/welcome` - Configure welcome messages (Admin)
-   `/rr` - Setup reaction roles (Admin)
-   `/ping` - Check bot latency

## 📋 TODO List

### 🔥 High Priority Features

#### 🐉 Enhanced Monster System

-   [ ] **Automatic Monster Spawning System** (not message-triggered)
    -   [ ] Time-based spawning with configurable intervals
    -   [ ] Location-based spawning (different channels = different biomes)
    -   [ ] Weather/time of day effects on spawn rates
    -   [ ] Boss monster events

#### ⚔️ Combat Systems

-   [ ] **PvE Fight System**

    -   [ ] Turn-based combat mechanics
    -   [ ] Skill/ability usage during fights
    -   [ ] Damage calculations based on character stats
    -   [ ] Status effects and buffs/debuffs
    -   [ ] Combat animations and visual feedback
    -   [ ] Loot drops and experience rewards

-   [ ] **PvP Fight System**
    -   [ ] Player vs Player combat mechanics
    -   [ ] Tournament system
    -   [ ] Ranking and matchmaking
    -   [ ] Spectator mode for fights
    -   [ ] PvP seasons and rewards

#### 🤖 NPC & AI System

-   [ ] **NPC System with AI**
    -   [ ] AI-powered NPCs using language models
    -   [ ] Dynamic dialogue generation
    -   [ ] NPC shops and trading
    -   [ ] Quest-giving NPCs
    -   [ ] Personality-based AI responses
    -   [ ] NPC relationship system

### 🎒 Economy & Items

#### 📦 Inventory System

-   [ ] **Player Inventory Management**
    -   [ ] Item storage and organization
    -   [ ] Equipment slots (weapons, armor, accessories)
    -   [ ] Item stacking and durability
    -   [ ] Inventory UI with pagination
    -   [ ] Item tooltips with detailed stats

#### 🗡️ Objects & Equipment

-   [ ] **Item System**
    -   [ ] Weapons (swords, bows, staffs, etc.)
    -   [ ] Armor sets with set bonuses
    -   [ ] Consumables (potions, food, scrolls)
    -   [ ] Crafting materials and recipes
    -   [ ] Rare and legendary items
    -   [ ] Item enhancement/upgrading system

#### 💰 Currency System

-   [ ] **Multi-Currency Economy**
    -   [ ] Gold (primary currency)
    -   [ ] Premium currency (gems/tokens)
    -   [ ] Guild currency for guild features
    -   [ ] Activity-based currency rewards
    -   [ ] Currency exchange system

### 💼 Progression Systems

#### 🏢 Job System

-   [ ] **Character Professions**
    -   [ ] Multiple job classes (Warrior, Mage, Rogue, etc.)
    -   [ ] Job-specific skills and abilities
    -   [ ] Job advancement and specialization
    -   [ ] Crafting professions (Blacksmith, Alchemist)
    -   [ ] Job-based quests and rewards

#### 📈 Advanced Leveling

-   [ ] **Roleplay-Based Progression**
    -   [ ] Experience based on roleplay activity quality
    -   [ ] AI analysis of roleplay messages
    -   [ ] Story participation bonuses
    -   [ ] Character development tracking
    -   [ ] Milestone achievements

### 🌍 World & Social Features

#### 🏰 Guild System

-   [ ] **Player Guilds**
    -   [ ] Guild creation and management
    -   [ ] Guild halls and upgrades
    -   [ ] Guild vs Guild combat
    -   [ ] Guild quests and events
    -   [ ] Guild banking system

#### 🗺️ World Map System

-   [ ] **Interactive World**
    -   [ ] Multiple regions and biomes
    -   [ ] Fast travel system
    -   [ ] Location-based events
    -   [ ] Weather and day/night cycles
    -   [ ] Region-specific monsters and NPCs

#### 📜 Quest Expansion

-   [ ] **Advanced Quest System**
    -   [ ] Multi-part storyline quests
    -   [ ] Daily and weekly quests
    -   [ ] Guild quests
    -   [ ] Dynamic event quests
    -   [ ] Quest chains with branching storylines

### 🎯 Quality of Life Improvements

#### 📊 Statistics & Analytics

-   [ ] **Detailed Statistics**
    -   [ ] Combat statistics tracking
    -   [ ] Roleplay activity metrics
    -   [ ] Achievement system
    -   [ ] Progress visualizations
    -   [ ] Leaderboards for various categories

#### 🔧 Administration Tools

-   [ ] **Enhanced Admin Features**
    -   [ ] Advanced moderation commands
    -   [ ] Server statistics dashboard
    -   [ ] Custom event creation tools
    -   [ ] Player management interface
    -   [ ] Automated moderation features

#### 🎨 UI/UX Enhancements

-   [ ] **Improved User Experience**
    -   [ ] Interactive menus with buttons
    -   [ ] Better error handling and user feedback
    -   [ ] Tutorial system for new users
    -   [ ] Customizable user preferences
    -   [ ] Mobile-friendly command interfaces

### 🔮 Advanced Features

#### 🧙‍♂️ Magic System

-   [ ] **Spell Casting System**
    -   [ ] Spell learning and progression
    -   [ ] Mana-based spell casting
    -   [ ] Elemental magic types
    -   [ ] Spell combinations and synergies
    -   [ ] Magical item enchanting

#### 🏠 Housing System

-   [ ] **Player Housing**
    -   [ ] Personal player homes
    -   [ ] Furniture and decoration system
    -   [ ] Storage expansion through housing
    -   [ ] Player home visiting
    -   [ ] Home-based crafting stations

#### 🎭 Roleplay Enhancements

-   [ ] **Advanced Roleplay Tools**
    -   [ ] Story mode with GM controls
    -   [ ] Dice rolling system
    -   [ ] Character background generator
    -   [ ] Relationship tracking between characters
    -   [ ] Roleplay session logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you need help or have questions:

-   Open an issue on GitHub
-   Join our Discord server (link to be added)
-   Check the documentation (coming soon)

---

<div align="center">
Made with ❤️ by nekoniyah and contributors
</div>
