import {Sequelize, DataTypes} from 'sequelize';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './users.sqlite',
    logging: console.log
});

const Users = sequelize.define('Users', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            notEmpty: true,
            len: [3, 150]
        }
    },

    firstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 50]
        }
    },

    lastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 50]
        }
    },

    passHash: {
        type: DataTypes.STRING(250),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [12, 250]
        }
    },

    role: {
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user'
    }

    // orders: {
    //     type: DataTypes.ARRAY,
    //     allowNull: true
    // }
}, {
    tableName: "users",
    timestamps: true
});

export default Users;