import Albums from "../models/Albums.js";
import Artists from "../models/Artists.js";
import Tracks from "../models/Tracks.js";
import { BAD_REQUEST, INTERNAL_ERROR, MISSING_FIELDS, RESOURCE_NOT_FOUND, UNAUTHORIZED_ACCESS } from "../utils/common.js";

const generateMissingFieldMessage = (missingFields) => {
    const fieldList = missingFields.join(' & ');
    return `${MISSING_FIELDS} ${fieldList}`;
};

export const createTrack = async (req, res) => {
    const { artist_id, album_id, name, duration, hidden } = req.body;
    const missingFields = []

    if (!artist_id) missingFields.push('artist_id');
    if (!album_id) missingFields.push('album_id');
    if (!name) missingFields.push('name');
    if (!duration) missingFields.push('duration');

    if (missingFields.length > 0) {
        const errorMessage = generateMissingFieldMessage(missingFields);
        return res.status(400).json({ message: errorMessage });
    }
    try {

        const isNameUsed = await Tracks.findOne({name})
        
        if (isNameUsed) {
            return res.status(409).json({ message: 'Track name is already used' });
        }

        const artist = await Artists.findById(artist_id);
        const album = await Albums.findById(album_id);

        if (!artist) {
            return res.status(404).json({ message: 'Artist not found' });
        }

        if (!album) {
            return res.status(404).json({ message: 'Album not found' });
        }

        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: UNAUTHORIZED_ACCESS });
        }

        const track = new Tracks({
            artist: artist_id,
            album: album_id,
            name,
            duration,
            hidden: hidden || false
        });

        await track.save();

        return res.status(201).json({
            status: 201,
            data: null,
            message: "Track created successfully.",
            error: null,
        });
    } catch (err) {
        return res.status(500).json({
            message: INTERNAL_ERROR,
            error: err.message || err.error,
        });
    }
};

export const getTracks = async (req, res) => {
    let { limit = 5, offset = 0, artist_id, album_id, hidden } = req.query;

    limit = parseInt(limit);
    offset = parseInt(offset);

    if (isNaN(limit) || isNaN(offset)) {
        return res.status(400).json({ message: BAD_REQUEST });
    }

    const filters = {};
    if (artist_id) filters.artist_id = artist_id;
    if (album_id) filters.album_id = album_id;
    if (hidden !== undefined) filters.hidden = hidden === 'true';

    try {
        const tracks = await Tracks.find(filters)
            .skip(offset)
            .limit(limit)
            .populate(['artist', 'album'])

        const trackData = tracks.map(track => ({
            track_id: track._id,
            artist_name: track.artist?.name,
            album_name: track.album?.name,
            name: track.name,
            duration: track.duration,
            hidden: track.hidden,
        }));

        return res.status(200).json({
            status: 200,
            data: trackData,
            message: "Tracks retrieved successfully.",
            error: null,
        });
    } catch (err) {
        return res.status(500).json({
            message: INTERNAL_ERROR,
            error: err.message || err.error,
        });
    }
};

export const getTrack = async (req, res) => {
    const { track_id } = req.params;

    try {
        const track = await Tracks.findById(track_id);

        if (!track) {
            return res.status(404).json({ message: RESOURCE_NOT_FOUND });
        }

        const trackData = {
            track_id: track._id,
            artist_name: track.artist_name,
            album_name: track.album_name,
            name: track.name,
            duration: track.duration,
            hidden: track.hidden,
        };

        return res.status(200).json({
            status: 200,
            data: trackData,
            message: "Track retrieved successfully.",
            error: null,
        });
    } catch (err) {
        return res.status(500).json({
            message: INTERNAL_ERROR,
            error: err.message || err.error,
        });
    }
};

export const updateTrack = async (req, res) => {
    const { track_id } = req.params;
    const { name, duration, hidden } = req.body;

    if (!name && !duration && hidden === undefined) {
        return res.status(400).json({ message: BAD_REQUEST });
    }

    try {
        const track = await Tracks.findById(track_id);

        if (!track) {
            return res.status(404).json({ message: 'Resource doesn\'t exist' });
        }

        // Here, you can add any additional permission checks, for example:
        // if (track.user_id !== req.user.user_id) {
        //     return res.status(403).json({ message: FORBIDDEN_ACCESS });
        // }

        if (name) track.name = name;
        if (duration) track.duration = duration;
        if (hidden) track.hidden = hidden;

        await track.save();

        return res.status(204).send();
    } catch (err) {
        return res.status(500).json({
            message: INTERNAL_ERROR,
            error: err.message || err.error,
        });
    }
};

export const deleteTrack = async (req, res) => {
    const { track_id } = req.params;

    try {
        const track = await Tracks.findById(track_id);

        if (!track) {
            return res.status(404).json({
                message: 'Resource doesn\'t exist',
            });
        }

        // Here, you can add any additional permission checks, for example:
        // if (track.user_id !== req.user.id) {
        //     return res.status(403).json({ message: FORBIDDEN_ACCESS });
        // }

        await track.deleteOne({ _id: track_id });

        return res.status(200).json({
            status: 200,
            data: null,
            message: `Track:${track.name} deleted successfully.`,
            error: null,
        });
    } catch (err) {
        return res.status(500).json({
            message: INTERNAL_ERROR,
            error: err.message || err.error,
        });
    }
};
