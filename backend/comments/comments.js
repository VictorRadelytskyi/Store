import {Sequelize, DataTypes} from 'sequelize';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './comments.sqlite'
});

const Comments = sequelize.define('Comments', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    body: {
        type: DataTypes.STRING(3000),
        allowNull: false,
        validate: {
            len: [3, 3000],
            notEmpty: true
        }
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },

    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    }
}, {
    timestamps: true,
    tableName:'comments'
});

export default Comments;