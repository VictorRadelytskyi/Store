import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_TOKEN || "Random_value";

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
