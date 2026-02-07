import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_TOKEN || "Random_value";
const REFRESH_SECRET = process.env.JWT_TOKEN || "Other_random_value";
const REFRESH_TOKEN_DURATION_SEC = process.env.REFRESH_TOKEN_DURATION_SEC || 20*60;
const ACCESS_TOKEN_DURATION_SEC = process.env.ACCESS_TOKEN_DURATION_SEC || 30;

export function generateAccessToken(user){
    return jwt.sign(
        {
            id: user.id,
            role: user.role
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