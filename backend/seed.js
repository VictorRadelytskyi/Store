import Products from './products/products.js';
import Users from './users/users.js';
import {generateRefreshToken} from './middleware/tokenService.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const ADMIN_PASS = process.env.ADMIN_PASS || "Admin_pass";
console.log(`ADMIN_PASS: ${ADMIN_PASS}`);
const VICTOR_PASS = process.env.VICTOR_PASS || "Victor_pass";
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 12;

export async function seedProducts(){
    try {
        const res = await fetch("https://fakestoreapi.com/products");
        const data = await res.json();
        const products = data.map(p => ({
            name: p.title,
            description: p.description,
            price: p.price,
            available: parseInt(process.env.DEFAULT_PRODUCTS_AVAILABLE) || 10,
            imgPath: p.image,
            category: p.category
        }));

        await Products.bulkCreate(products);
        console.log(`${products.length} products seeded successfully`);
    } catch (err) {
        console.error(`Error seeding products: ${err}`);
    }
}

export async function seedUsers(){
    const adminHash = await bcrypt.hash(ADMIN_PASS, SALT_ROUNDS);
    const victorHash = await bcrypt.hash(VICTOR_PASS, SALT_ROUNDS);
    
    const admin = {
        id: 1,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'Admin',
        email: 'admin@store.com',
        passHash: adminHash
    };
    admin.refreshToken = generateRefreshToken(admin);

    const victor = {
        id: 2,
        role: 'user',
        firstName: 'Victor',
        lastName: 'Radelytskyi',
        email: 'victor@store.com',
        passHash: victorHash
    };
    victor.refreshToken = generateRefreshToken(victor);

    try {
        await Promise.all([
            Users.create(admin),
            Users.create(victor)
        ]);
        console.log('Admin and Victor users created successfully');
    } catch(err){
        console.error(`Error creating admin and victor users: ${err}`);
    }
}