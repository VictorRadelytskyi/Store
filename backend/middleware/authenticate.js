import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET || "Random_value";

export default function authenticate(req, res, next){
    const token = req.headers.authorization?.split(' ')[1];
    if (!token){
        return res.status(401).json({
            error: "No token, access denied"
        });
    }

    try{
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }catch(err){
        return res.status(401).json({
            error: "Failed to authenticate"
        });
    }
}
