import Users from "../models/User.js";
import bcrypt from 'bcrypt'
import {
    USER_CREATED_SUCCESSFULLY,
    USER_NOTFOUND,
    INCORRECT_PASSWORD,
    EMAIL_ALREADY_EXISTS,
    USER_RETRIEVED,
    UNAUTHORIZED_ACCESS,
    FORBIDDEN_ACCESS,
    BAD_REQUEST,
    INTERNAL_ERROR,
    USER_DELETED,
    isAdmin,
    createNewUser,
} from '../utils/common.js'

export const getUsers = async (req, res) => {
    const { limit, role, offset } = req.query;
    const query = {}

    if (!isAdmin(req.user)) {
        return res.status(401).json({ message: "Unauthorized Access" })
    }

    if (role !== undefined) {
        query.role = role
    }

    const users = await Users.find(query)
        .skip(offset)
        .limit(limit)
        .select({ password: 0 });

    return res.status(200).json({ message: USER_RETRIEVED, data: users, error: null })
}

export const addUser = async (req, res) => {
    const roles = ['viewer', 'editor']
    const { email, role, password } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ message: BAD_REQUEST });
    }

    if (!roles.includes(role)) {
        return res.status(409).json({ message: FORBIDDEN_ACCESS });
    }

    const loggedInUser = req.user;

    if (!isAdmin(loggedInUser)) {
        return res.status(401).json({ message: UNAUTHORIZED_ACCESS });
    }

    const emailExist = await Users.findOne({ email });

    if (emailExist) {
        return res.status(403).json({ message: EMAIL_ALREADY_EXISTS });
    }

    await createNewUser({email, password, role})
    return res.status(201).json({ message: USER_CREATED_SUCCESSFULLY });
}

export const deleteUser = async (req, res) => {
    const { user_id } = req.params;
    const loggedInUser = req.user;
    console.log("🚀 ~ deleteUser ~ req.user:", req.user)

    if (!isAdmin(loggedInUser)) {
        return res.status(401).json({ message: UNAUTHORIZED_ACCESS });
    }

    const user = await Users.findByIdAndDelete(user_id);

    if (!user) {
        return res.status(404).json({
            status: 404,
            data: null,
            message: USER_NOTFOUND,
            error: "Not Found",
        });
    }

    return res.status(200).json({
        status: 200,
        data: null,
        message: USER_DELETED,
        error: null,
    });
}

export const updatePassword = async (req, res) => {
    const loggedInUser = req.user;
    const { oldPassword, newPassword } = req.body;
    const missingFields = [];

    if (!newPassword) missingFields.push('new password');
    if (!oldPassword) missingFields.push('old password');
    if (missingFields.length > 0) {
        const errorMessage = generateMissingFieldMessage(missingFields);
        return res.status(400).json({ message: errorMessage });
    }

    try {
        const user = await Users.findById(loggedInUser.user_id);

        if (!user) {
            return res.status(404).json({ message: USER_NOTFOUND });
        }

        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ msg: INCORRECT_PASSWORD });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await Users.updateOne({ _id: loggedInUser.user_id }, { $set: { password: hashedPassword } });

        return res.status(204).send();
    } catch (err) {
        return res.status(500).json({
            message: INTERNAL_ERROR,
            error: err.message || err.error,
        });
    }
}
