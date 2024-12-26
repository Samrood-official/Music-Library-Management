import { Schema, model } from "mongoose";

const artistSchema = Schema({
    name: {
        type: String,
        required: true,
    },
    grammy: {
        type: Number,
        required: true,
    },
    hidden: {
        type: Boolean,
        required: true,
    },
});

export default model("artist", artistSchema);
