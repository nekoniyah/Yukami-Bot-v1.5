import { DataTypes, Model } from "sequelize";
import db from "./db";

/**
 * Database Models for Yukami Bot
 *
 * This file defines all Sequelize models used by the bot for data persistence.
 * Each model represents a table in the SQLite database.
 */

// ============================================================================
// WELCOME SYSTEM MODEL
// ============================================================================

/**
 * Welcome configuration for Discord guilds
 * Stores settings for welcome messages and auto-role assignment
 */
export class Welcome extends Model {
    declare id: number;
    declare guildId: string;
    declare channelId: string | null;
    declare message: string | null;
    declare userRoleIds: string | null; // JSON string of role IDs for users
    declare botRoleIds: string | null; // JSON string of role IDs for bots
    declare createdAt: Date;
    declare updatedAt: Date;
}

export const WelcomeModel = db.makeModel(
    Welcome,
    {
        guildId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true, // One welcome config per guild
            comment: "Discord guild ID where this welcome config applies",
        },
        channelId: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "Channel ID where welcome messages are sent",
        },
        message: {
            type: DataTypes.TEXT, // Use TEXT for longer messages
            allowNull: true,
            comment: "Custom welcome message template",
        },
        userRoleIds: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: "JSON array of role IDs to assign to new users",
        },
        botRoleIds: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: "JSON array of role IDs to assign to new bots",
        },
    },
    {
        indexes: [
            { fields: ["guildId"] }, // Index for faster guild lookups
        ],
    }
);

// ============================================================================
// REACTION ROLES MODEL
// ============================================================================

/**
 * Reaction Role system for Discord messages
 * Maps emoji reactions to role assignments
 */
export class ReactionRole extends Model {
    declare id: number;
    declare guildId: string;
    declare messageId: string;
    declare roleIds: string; // JSON string of role IDs
    declare emoji: string;
    declare createdAt: Date;
    declare updatedAt: Date;
}

export const ReactionRoleModel = db.makeModel(
    ReactionRole,
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        guildId: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "Discord guild ID",
        },
        messageId: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "Discord message ID that contains the reaction roles",
        },
        roleIds: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "JSON array of role IDs to assign/remove",
        },
        emoji: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "Emoji identifier (Unicode or custom emoji ID)",
        },
    },
    {
        indexes: [
            { fields: ["guildId"] },
            { fields: ["messageId"] },
            { fields: ["messageId", "emoji"], unique: true }, // Prevent duplicate emoji per message
        ],
    }
);

// ============================================================================
// AVATAR SYSTEM MODEL
// ============================================================================

/**
 * User avatars for role-playing system
 * Each user can have multiple avatars with different species and attributes
 */
export class Avatar extends Model {
    declare id: number;
    declare userId: string;
    declare icon: string;
    declare bracket: string;
    declare name: string;
    declare species: string;
    declare level: number;
    declare createdAt: Date;
    declare updatedAt: Date;
}

export const AvatarModel = db.makeModel(
    Avatar,
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "Discord user ID who owns this avatar",
        },
        icon: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue:
                "https://st3.depositphotos.com/9998432/13335/v/450/depositphotos_133352156-stock-illustration-default-placeholder-profile-icon.jpg",
            comment: "Avatar image URL",
        },
        bracket: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "Message bracket format (e.g., '[text]' or '(text)')",
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "Avatar character name",
        },
        species: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "Character species (references displays.json)",
        },
        level: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 1,
                max: 100, // Set reasonable level cap
            },
            comment: "Avatar level for stat calculations",
        },
    },
    {
        indexes: [
            { fields: ["userId"] },
            { fields: ["userId", "name"], unique: true }, // Prevent duplicate names per user
        ],
    }
);

// ============================================================================
// LEVELING SYSTEM MODELS
// ============================================================================

/**
 * User experience and leveling system
 */
export class UserLevel extends Model {
    declare id: number;
    declare userId: string;
    declare level: number;
    declare experience: number;
    declare createdAt: Date;
    declare updatedAt: Date;
}

export const UserLevelModel = db.makeModel(
    UserLevel,
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true, // One level record per user
            comment: "Discord user ID",
        },
        level: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 1,
            },
            comment: "User's current level",
        },
        experience: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0,
            },
            comment: "User's total experience points",
        },
    },
    {
        indexes: [
            { fields: ["level"] }, // For leaderboard queries
            { fields: ["experience"] },
        ],
    }
);

// ============================================================================
// QUEST SYSTEM MODELS
// ============================================================================

/**
 * Quest definitions
 */
export class Quest extends Model {
    declare id: number;
    declare name: string;
    declare description: string;
    declare rewardXp: number;
    declare rewardItems: any[]; // JSON array
    declare isActive: boolean;
    declare createdAt: Date;
    declare updatedAt: Date;
}

export const QuestModel = db.makeModel(Quest, {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: "Unique quest name identifier",
    },
    description: {
        type: DataTypes.TEXT,
        comment: "Quest description and objectives",
    },
    rewardXp: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0,
        },
        comment: "Experience points rewarded upon completion",
    },
    rewardItems: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment: "Array of items rewarded upon completion",
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: "Whether this quest is currently available",
    },
});

/**
 * User quest progress tracking
 */
export class CharacterQuest extends Model {
    declare id: number;
    declare characterId: number; // References Avatar.id
    declare questId: number; // References Quest.id
    declare status: "active" | "completed" | "failed";
    declare progress: any; // JSON object for quest progress
    declare startedAt: Date;
    declare completedAt: Date | null;
    declare createdAt: Date;
    declare updatedAt: Date;
}

export const CharacterQuestModel = db.makeModel(
    CharacterQuest,
    {
        characterId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "Avatar ID participating in the quest",
        },
        questId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "Quest ID being undertaken",
        },
        status: {
            type: DataTypes.ENUM("active", "completed", "failed"),
            defaultValue: "active",
            comment: "Current status of the quest",
        },
        progress: {
            type: DataTypes.JSON,
            defaultValue: {},
            comment: "Quest progress data (objectives completed, etc.)",
        },
        startedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            comment: "When the quest was started",
        },
        completedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "When the quest was completed (if applicable)",
        },
    },
    {
        indexes: [
            { fields: ["characterId"] },
            { fields: ["questId"] },
            { fields: ["status"] },
            { fields: ["characterId", "questId"], unique: true }, // Prevent duplicate quests per character
        ],
    }
);

// ============================================================================
// MODEL ASSOCIATIONS
// ============================================================================

/**
 * Define relationships between models
 */
// Avatar belongs to User (via userId)
// Quest has many CharacterQuests
QuestModel.hasMany(CharacterQuestModel, { foreignKey: "questId" });
CharacterQuestModel.belongsTo(QuestModel, { foreignKey: "questId" });

// Avatar has many CharacterQuests
AvatarModel.hasMany(CharacterQuestModel, { foreignKey: "characterId" });
CharacterQuestModel.belongsTo(AvatarModel, { foreignKey: "characterId" });

// Initialize database
await db.init();

console.log("✅ All models initialized successfully");
