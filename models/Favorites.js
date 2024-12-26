import { Schema, model } from "mongoose";

const favoriteSchema = Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['artist', 'album', 'track'],
    },
    item_id: {
        type: Schema.Types.ObjectId,
        refPath: 'category',
        required: true
    },
}, { timestamp: true });

export default model("favorite", favoriteSchema)
