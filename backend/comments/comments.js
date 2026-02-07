import {Sequelize, DataTypes} from 'sequelize';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './estore.sqlite',  // Shared database
    logging: false
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
        },
        onDelete: 'CASCADE'
    },

    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        },
        onDelete: 'CASCADE'
    }
}, {
    timestamps: true,
    tableName:'comments',
    indexes: [
        {
            fields: ['productId']
        },
        {
            fields: ['userId']
        },
        {
            fields: ['productId', 'userId']  // Composite index
        }
    ]
});

export default Comments;