import { Schema, model } from "mongoose";

const userSchema = Schema({
    name: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        // (admin, editor, viewer)
    },
    
}, { timestamps: true });

const Users = model('user', userSchema);

export default Users;
