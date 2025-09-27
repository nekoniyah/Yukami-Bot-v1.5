import { Sequelize, Model, ModelStatic, ModelAttributes } from "sequelize";

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./db/database.db",
});

export default {
    init: async () => {
        await sequelize.sync();
    },

    makeModel<T extends ModelStatic<Model>>(
        model: T,
        options: ModelAttributes<InstanceType<T>>
    ) {
        return model.init(options, { sequelize });
    },
};
