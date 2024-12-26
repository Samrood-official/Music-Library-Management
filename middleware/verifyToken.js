import Jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
import redisClient from '../utils/redis.js';
dotenv.config()
const jwt_secret_key = process.env.secret_key

const verifyToken = async (req, res, next) => {
    const authHeader = req.header("Authorization")
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        try {
            const isBlacklisted = await redisClient.get(token) === "blacklisted"
            if (isBlacklisted) {
                return res.status(401).json("token is black listed")
            }
        } catch (err) { console.log(err) }

        Jwt.verify(token, jwt_secret_key, (err, user) => {
            if (err) { return res.status(403).json("Token is not valid") }
            req.user = user
            next();
        })
    } else {
        res.status(401).json("You Are Not Authenticated !!!")
    }
}

export default verifyToken;
