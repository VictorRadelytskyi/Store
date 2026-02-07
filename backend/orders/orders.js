import {Sequelize, DataTypes} from 'sequelize';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './orders.sqlite'
});

const Orders = sequelize.define('Orders', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
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

    status: {
        type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false
    },

    items: {
        type: DataTypes.TEXT,
        get(){
            const rawValue = this.getDataValue('items');
            return rawValue ? JSON.parse(rawValue) : []
        },
        set(value){
            this.setDataValue('items', JSON.stringify(value));
        }
    },
    
    totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0.01
        }
    }
}, {
    tableName: 'orders',
    timestamps: true
});

export default Orders;