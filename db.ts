import {
    Sequelize,
    Model,
    ModelStatic,
    ModelAttributes,
    InitOptions,
} from "sequelize";

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./db/database.db",
});

export default {
    init: async () => {
        await sequelize.sync();
    },

    makeModel<T extends Model>(
        model: ModelStatic<T>, // proper "static" model type
        attributes: ModelAttributes<T, any>, // attributes typed for that model
        options: Omit<InitOptions<T>, "sequelize" | "modelName"> = {}
    ) {
        model.init(attributes, {
            sequelize,
            modelName: (model as any).name,
            ...options,
        });

        return model as ModelStatic<T>;
    },
};
