import { Schema, model } from "mongoose";

const trackSchema = Schema({
    name: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    hidden: {
        type: Boolean,
        required: true,
    },
    artist: {
        type: Schema.Types.ObjectId,
        ref: 'artist',
        required: true
    },
    album: {
        type: Schema.Types.ObjectId,
        ref: 'album',
        required: true
    },
    duration: {
        type: Number,
        required: true,
    }

});

export default model("track", trackSchema)
