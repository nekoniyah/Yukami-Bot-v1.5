import { DataTypes, Model } from "sequelize";
import db from "./db";

export class Welcome extends Model {}

export const WelcomeModel = db.makeModel(Welcome, {
    guildId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    channelId: {
        type: DataTypes.STRING,
    },
    message: {
        type: DataTypes.STRING,
    },
    userRoleIds: {
        type: DataTypes.STRING,
    },
    botRoleIds: {
        type: DataTypes.STRING,
    },
});

export class ReactionRole extends Model {}

export const ReactionRoleModel = db.makeModel(ReactionRole, {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    guildId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    messageId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    roleIds: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    emoji: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

export class Avatar extends Model {}
export const AvatarModel = db.makeModel(Avatar, {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue:
            "https://st3.depositphotos.com/9998432/13335/v/450/depositphotos_133352156-stock-illustration-default-placeholder-profile-icon.jpg",
    },
    bracket: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

export class UseLevel extends Model {}
export const UseLevelModel = db.makeModel(UseLevel, {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

await db.init();
