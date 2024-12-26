import Users from "../models/User.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import {
    USER_CREATED_SUCCESSFULLY,
    USER_NOTFOUND,
    INCORRECT_PASSWORD,
    USER_LOGGEDIN,
    USER_LOGGEDOUT,
    EMAIL_ALREADY_EXISTS,
    INTERNAL_ERROR,
    generateMissingFieldMessage,
    BAD_REQUEST,
    createNewUser,
} from '../utils/common.js'
import redisClient from "../utils/redis.js";

export const register = async (req, res) => {
    let { name, email, password, role } = req.body;
    const missingFields = [];

    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (!name) missingFields.push('name');
    if (missingFields.length > 0) {
        const errorMessage = generateMissingFieldMessage(missingFields);
        return res.status(400).json({ message: errorMessage });
    }

    try {
        const emailExist = await Users.findOne({ email })

        if (emailExist) {
            return res.status(409).json({ message: EMAIL_ALREADY_EXISTS });
        }

        await createNewUser({name, email, password, role})

    } catch (err) {
        return res.status(500).json({ message: INTERNAL_ERROR, err: err.message || err.error });
    }

    return res.status(201).json({ message: USER_CREATED_SUCCESSFULLY });
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    const missingFields = [];
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');

    if (missingFields.length > 0) {
        const errorMessage = generateMissingFieldMessage(missingFields);
        return res.status(400).json({ message: errorMessage });
    }

    try {
        const userData = await Users.findOne({ email })

        if (!userData) {
            return res.status(404).json({ message: USER_NOTFOUND });
        }

        const isMatch = await bcrypt.compare(password, userData.password)

        if (!isMatch) {
            return res.status(401).json({ msg: INCORRECT_PASSWORD })
        }

        const user = {
            user_id: userData._id,
            name: userData.name,
            email: userData.email,
            role: userData.role
        }
        const token = jwt.sign({
            user_id: userData._id, role: user.role
        }, process.env.secret_key, { expiresIn: '1h' })

        return res.status(200).json({
            message: USER_LOGGEDIN,
            data: { token, user },
        });
    } catch (err) {
        return res.status(500).json({
            message: INTERNAL_ERROR,
            error: err.message || err.error,
        });
    }
}


const blacklistToken = async (token) => {
    try {
        await redisClient.set(token, 'blacklisted');
    } catch (err) {
        console.error('Error blacklisting token:', err);
    }
    return;
}

export const logout = async (req, res) => {
    const authHeader = req.header("Authorization")

    if (!authHeader) {
        return res.status(400).json({ message: BAD_REQUEST });
    }

    const token = authHeader.split(" ")[1];
    await blacklistToken(token)
    return res.status(200).json({ message: USER_LOGGEDOUT });
}
