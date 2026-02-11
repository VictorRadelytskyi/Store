import {Sequelize, DataTypes} from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'estore.sqlite');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath
});

const Products = sequelize.define('Products', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 150]  
        }
    },

    description: {
        type: DataTypes.STRING(2500),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [5, 2500]
        }
    },

    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            notEmpty: true,
            min: 0.01
        }
    },
    
    available: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },

    img_path: {
        type: DataTypes.STRING(250),
        allowNull: false,
        defaultValue: "../../frontend/public/no-img.png"
    }
}, {
    tableName: 'products',
    timestamps: true
});

export default Products;