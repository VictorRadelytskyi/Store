import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET || "Random_value";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "Other_random_value";
const REFRESH_TOKEN_DURATION_SEC = process.env.REFRESH_TOKEN_DURATION_SEC || (20 * 60);
const ACCESS_TOKEN_DURATION_SEC = process.env.ACCESS_TOKEN_DURATION_SEC || 30;

export function generateAccessToken(user){
    return jwt.sign(
        {
            id: user.id,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName
        }, 
        JWT_SECRET,
        {
            expiresIn: `${ACCESS_TOKEN_DURATION_SEC}s`
        }
    )
}

export function generateRefreshToken(user){
    return jwt.sign(
        {
            id: user.id,
        },
        REFRESH_SECRET,
        {
            expiresIn: `${REFRESH_TOKEN_DURATION_SEC}s`
        }
    )
}