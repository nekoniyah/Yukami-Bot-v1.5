# 🎭 Yukami Bot v1.5

<div align="center">

[![Discord.js](https://img.shields.io/badge/Discord.js-v14.21.0-blue.svg)](https://discord.js.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Runtime-Bun-orange.svg)](https://bun.sh/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-green.svg)](https://www.sqlite.org/)
[![React](https://img.shields.io/badge/React-v19.1.1-61DAFB.svg)](https://reactjs.org/)

_Un bot Discord riche en fonctionnalités pour le serveur Discord Yukami RP avec gestion d'avatars, système de niveau et interactions dynamiques_

</div>

## 🌟 Fonctionnalités

### 🎭 Système d'Avatar Roleplay

-   **Personnages Multiples**: Les utilisateurs peuvent créer et gérer plusieurs avatars de roleplay
-   **Système d'Espèces**: 6 espèces différentes (Humain, Elfe, Dragon, Ange, Faunid, Félinade Empyréenne) avec progressions de stats uniques
-   **Stats Dynamiques**: Calculs de stats basés sur le niveau pour vitalité, attaque, défense, dextérité, agilité et mana
-   **Cartes de Personnage Visuelles**: Images de personnages auto-générées utilisant des composants React
-   **Gestion de Personnage**: Créer, modifier, supprimer et changer entre les avatars
-   **Système de Crochets**: Formatage de message personnalisable pour le roleplay avec intégration webhook
-   **Intégration Webhook**: Changement fluide de personnage avec avatars et noms personnalisés

### 📈 Système de Niveau

-   **Progression Utilisateur**: Suivi d'expérience et de niveau pour les utilisateurs
-   **Niveaux de Personnage**: Système de niveau individuel pour chaque avatar
-   **Intégration Quêtes**: Système de quêtes avec suivi de progression et récompenses
-   **Classements**: Système de classement basé sur le niveau

### 👋 Accueil & Modération

-   **Messages d'Accueil Personnalisés**: Messages d'accueil configurables pour les nouveaux membres
-   **Attribution Automatique de Rôles**: Attribution automatique de rôles pour les utilisateurs et bots
-   **Configuration Spécifique au Serveur**: Paramètres d'accueil par serveur

### ⚡ Rôles par Réaction

-   **Gestion Interactive de Rôles**: Les utilisateurs peuvent s'attribuer/retirer des rôles via les réactions emoji
-   **Plusieurs Rôles par Emoji**: Support pour l'attribution de plusieurs rôles avec une réaction
-   **Intégration Serveur**: Configurations de rôles par réaction spécifiques au serveur

### 🐉 Système de Rencontre de Monstres (Implémentation Actuelle)

-   **Intégration Canaux Roleplay**: Les monstres apparaissent spécifiquement dans les canaux de roleplay désignés pendant les conversations actives
-   **Rencontres Déclenchées par Messages**: 20% de chance d'apparition par message avec cooldown de 5 minutes par canal
-   **Mise à l'Échelle Appropriée au Niveau**: Les niveaux des monstres s'adaptent à la progression des joueurs (variance de ±1 niveau)
-   **Cartes de Monstre Visuelles**: Images de monstres générées dynamiquement avec affichage des stats
-   **Espèces Multiples**: Monstres Bête, Élémentaire, Dragon, Mort-vivant, Démon, Fée avec caractéristiques uniques
-   **Système de Rareté**: Monstres Commun, Peu commun, Rare, Épique, Légendaire avec taux d'apparition différents
-   **Génération Basée sur Templates**: Templates de monstres pré-conçus avec stats et capacités équilibrées

### 🎨 Composants Visuels

-   **Rendu Basé React**: Composants React côté serveur pour la génération d'images
-   **Galeries de Personnages**: Affichage visuel de plusieurs personnages
-   **Cartes de Monstre**: Cartes d'information détaillées des monstres avec stats et capacités

## 🛠️ Stack Technique

-   **Runtime**: Bun (Runtime JavaScript haute performance)
-   **Framework**: Discord.js v14
-   **Langage**: TypeScript
-   **Base de données**: SQLite avec Sequelize ORM
-   **Génération d'Images**: @vercel/og + Satori + React v19.1.1
-   **Environnement**: dotenv pour la configuration

## 📦 Installation

1. **Cloner le dépôt**

    ```bash
    git clone https://github.com/nekoniyah/yukami-bot-v1.5.git
    cd yukami-bot-v1.5
    ```

2. **Installer les dépendances**

    ```bash
    bun install
    ```

3. **Configurer l'environnement**

    ```bash
    cp .env.example .env
    # Éditer .env avec votre token de bot Discord et autres paramètres
    ```

4. **Lancer le bot**
    ```bash
    bun start
    ```

## ⚙️ Configuration

Créer un fichier `.env` avec les variables suivantes :

```env
# Configuration du Bot Discord
TOKEN=your_discord_bot_token_here
NAME=Yukami Bot

# Configuration Base de données
DATABASE_URL=./db/database.db

# Environnement
NODE_ENV=production

# Paramètres de Performance
CACHE_TTL=300000
MAX_AVATARS_PER_USER=10

# Paramètres Système de Monstres
MONSTER_SPAWN_CHANCE=20
MONSTER_SPAWN_COOLDOWN=300000
```

## 📁 Structure du Projet

```
yukami-bot-v1.5/
├── components/          # Composants React pour génération d'images
│   ├── CharacterCard.tsx
│   ├── Characters.tsx
│   └── MonsterCard.tsx
├── db/                  # Configuration base de données et données
│   ├── displays.json    # Noms d'affichage des espèces
│   └── stats.json       # Configurations stats des espèces
├── events/              # Gestionnaires d'événements Discord
│   ├── clientReady.ts
│   ├── guildMemberAdd.ts
│   ├── interactionCreate.ts
│   ├── messageCreate.ts
│   ├── messageReactionAdd.ts
│   ├── messageReactionRemove.ts
│   └── monsterSpawn.ts
├── interactions/        # Gestionnaires de commandes slash et boutons
│   ├── avatar.ts
│   ├── createAvatar.ts
│   ├── editAvatar.ts
│   ├── welcome.ts
│   └── rr.ts
├── locales/            # Fichiers d'internationalisation
│   └── fr.json         # Traductions françaises
├── registers/          # Enregistrement des commandes
├── utils/              # Fonctions utilitaires
│   ├── db.ts
│   ├── models.ts
│   ├── monsters.ts     # Système de génération de monstres
│   └── render.tsx
└── index.ts            # Point d'entrée principal du bot
```

## 🚀 Commandes

-   `/avatar` - Gérer vos avatars de roleplay
-   `/welcome` - Configurer les messages d'accueil (Admin)
-   `/rr` - Configurer les rôles par réaction (Admin)
-   `/ping` - Vérifier la latence du bot

## 📋 TODO - Système de Rencontre de Monstres

### 🐉 Système de Monstres Amélioré

#### 🎲 Génération Aléatoire de Monstres

-   [ ] **Génération Procédurale Complète**

    -   [ ] **Noms Aléatoires**: Système de génération de noms avec combinaisons préfixe + suffixe

        -   [ ] Base de données de préfixes par espèce (ex: "Sombre", "Ancien", "Féroce")
        -   [ ] Base de données de suffixes par espèce (ex: "griffe", "croc", "ombre")
        -   [ ] Noms uniques avec variations culturelles par biome

    -   [ ] **Stats Aléatoires**: Distribution dynamique des statistiques
        -   [ ] Formules mathématiques basées sur espèce + rareté + niveau
        -   [ ] Variation aléatoire de ±10-15% pour l'unicité
        -   [ ] Stats spécialisées selon l'espèce (Dragons = plus d'attaque, Élémentaires = plus de mana)
        -   [ ] Bonus de stats selon la rareté (Légendaire = +50% stats de base)

#### ⏰ Système d'Apparition Automatique

-   [ ] **Apparition Basée sur le Temps**
    -   [ ] Remplacement complet du système déclenché par messages
    -   [ ] Intervalles d'apparition configurables par canal (ex: toutes les 2-4 heures)
    -   [ ] Système d'événements spéciaux avec taux d'apparition augmentés
    -   [ ] Apparitions nocturnes avec monstres différents (plus dangereux)
-   [ ] **Événements Boss Programmés**
    -   [ ] Boss monstres avec annonces serveur-wide
    -   [ ] Calendrier d'événements hebdomadaires/mensuels
    -   [ ] Récompenses spéciales pour les événements boss
    -   [ ] Système de participation de groupe pour les boss

#### ⚙️ Configuration Administrative

-   [ ] **Outils de Configuration**
    -   [ ] Commandes admin pour configurer les taux d'apparition par canal
    -   [ ] Interface pour définir les biomes et leurs monstres
    -   [ ] Système de whitelist/blacklist d'espèces par canal
    -   [ ] Configuration des événements spéciaux
-   [ ] **Statistiques et Monitoring**
    -   [ ] Logs d'apparition de monstres
    -   [ ] Statistiques de rencontres par canal/joueur
    -   [ ] Monitoring de la santé de l'écosystème
    -   [ ] Alertes pour les déséquilibres de population

---

_Plus de fonctionnalités seront ajoutées au TODO selon les besoins du serveur_

## 🤝 Contribution

1. Fork le dépôt
2. Créer une branche de fonctionnalité (`git checkout -b feature/fonctionnalite-geniale`)
3. Commit les changements (`git commit -m 'Ajouter une fonctionnalité géniale'`)
4. Push sur la branche (`git push origin feature/fonctionnalite-geniale`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails.

## 🆘 Support

Si vous avez besoin d'aide ou avez des questions :

-   🐛 [Signaler des bugs sur GitHub](https://github.com/nekoniyah/yukami-bot-v1.5/issues)
-   💬 Contactez directement les développeurs sur le serveur Discord

---

<div align="center">

**✨ Créé avec ❤️ par nekoniyah et contributeurs ✨**

</div>
