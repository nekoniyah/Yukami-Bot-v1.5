import {
    Sequelize,
    Model,
    ModelStatic,
    ModelAttributes,
    InitOptions,
} from "sequelize";
import path from "path";

/**
 * Database Configuration and Utilities
 *
 * This module handles SQLite database initialization and provides
 * a helper method for creating Sequelize models with proper typing.
 */

// Ensure database directory exists
const dbPath = path.join(process.cwd(), "db", "database.db");

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: dbPath,
    logging: process.env.NODE_ENV === "development" ? console.log : false, // Only log in development
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});

export default {
    /**
     * Initialize database connection and sync all models
     *
     * @param force - Whether to force recreate all tables (default: false)
     * @returns Promise that resolves when database is ready
     */
    init: async (force: boolean = false): Promise<void> => {
        try {
            // Test the connection
            await sequelize.authenticate();
            console.log("✅ Database connection established successfully");

            // Sync all models
            await sequelize.sync({ force });
            console.log(
                `✅ Database models synchronized${force ? " (forced)" : ""}`
            );
        } catch (error) {
            console.error("❌ Database initialization failed:", error);
            throw error;
        }
    },

    /**
     * Create a new Sequelize model with proper typing
     *
     * @param model - The model class to initialize
     * @param attributes - Model attributes definition
     * @param options - Additional initialization options
     * @returns The initialized model with proper typing
     */
    makeModel<T extends Model>(
        model: ModelStatic<T>,
        attributes: ModelAttributes<T, any>,
        options: Omit<InitOptions<T>, "sequelize" | "modelName"> = {}
    ): ModelStatic<T> {
        model.init(attributes, {
            sequelize,
            modelName: (model as any).name,
            // Add default options for better performance
            indexes: options.indexes || [],
            timestamps: options.timestamps !== false, // Default to true
            ...options,
        });

        return model as ModelStatic<T>;
    },

    /**
     * Close database connection
     */
    close: async (): Promise<void> => {
        await sequelize.close();
        console.log("🔒 Database connection closed");
    },

    /**
     * Get the Sequelize instance for advanced operations
     */
    getSequelize: (): Sequelize => sequelize,
};
