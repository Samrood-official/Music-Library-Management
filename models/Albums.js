import { Schema, model } from "mongoose";

const albumSchema = Schema({
    name: {
        type: String,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    artist_id: {
        type: Schema.Types.ObjectId,
        ref: 'artist',
        required: true
    },
    hidden: {
        type: Boolean,
    },
});

export default model("album", albumSchema)
