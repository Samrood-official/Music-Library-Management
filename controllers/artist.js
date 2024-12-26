import Artists from "../models/Artists.js";
import { ARTIST_CREATED, ARTIST_NOT_FOUND, ARTISTS_FETCHED_SUCCESSFULLY, BAD_REQUEST, FORBIDDEN_ACCESS, INTERNAL_ERROR, isAdmin, TRUE_STRING, UNAUTHORIZED_ACCESS } from "../utils/common.js";

export const getArtists = async (req, res) => {
    try {
        const loggedInUser = req.user;

        if (!loggedInUser) {
            return res.status(401).json({ message: UNAUTHORIZED_ACCESS });
        }

        const { limit = 5, offset = 0, grammy, hidden } = req.query;

        const pageLimit = parseInt(limit, 10);
        const pageOffset = parseInt(offset, 10);

        const query = {};

        console.log("🚀 ~ getArtists ~ typeof grammy:", typeof grammy)
        if (grammy !== undefined) {
            query.grammy = parseInt(grammy, 10);
        }

        if (hidden !== undefined) {
            query.hidden = hidden === TRUE_STRING;
        }
        console.log("🚀 ~ getArtists ~ query:", query)

        const artists = await Artists.find(query)
            .skip(pageOffset)
            .limit(pageLimit)
            .exec();

        res.status(200).json({
            message: ARTISTS_FETCHED_SUCCESSFULLY,
            data: artists
        });
    } catch (error) {
        console.error('Error fetching artists:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const addArtist = async (req, res) => {
    const { name, grammy, hidden } = req.body;

    // Check for missing fields
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (grammy === undefined) missingFields.push('grammy');
    if (hidden === undefined) missingFields.push('hidden');

    if (missingFields.length > 0) {
        return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    const isNameUsed = await Artists.findOne({ name });

    if (isNameUsed) {
        return res.status(409).json({ message: 'Artist name is already used' });
    }

    try {
        const newArtist = new Artists({
            name,
            grammy,
            hidden,
        });

        await newArtist.save();

        return res.status(201).json({ message: ARTIST_CREATED, data: newArtist });
    } catch (err) {
        return res.status(500).json({
            message: INTERNAL_ERROR,
            error: err.message || err.error,
        });
    }
}

export const updateArtist = async (req, res) => {
    const { artist_id } = req.params; // Get the artist ID from URL parameters
    const { name, grammy, hidden } = req.body;

    // Authorization check (if required)
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: UNAUTHORIZED_ACCESS });
    }

    if (!name && grammy === undefined && hidden === undefined) {
        return res.status(400).json({ message: BAD_REQUEST });
    }

    try {
        const artist = await Artists.findById(artist_id);

        const isNameUsed = await Artists.findOne({ name })
        if (isNameUsed) {
            return res.status(409).json({ message: 'Artist name is already used' });
        }
        if (!artist) {
            return res.status(404).json({ message: ARTIST_NOT_FOUND });
        }

        const loggedInUser = req.user
        if (!isAdmin(loggedInUser)) {
            return res.status(403).json({ message: FORBIDDEN_ACCESS });
        }

        if (name !== undefined) artist.name = name;
        if (grammy !== undefined) artist.grammy = grammy;
        if (hidden !== undefined) artist.hidden = hidden;

        await artist.save();

        return res.status(204).send();
    } catch (err) {
        return res.status(500).json({
            message: INTERNAL_ERROR,
            error: err.message || err.error,
        });
    }
};

export const deleteArtist = async (req, res) => {
    const { artist_id } = req.params;

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: UNAUTHORIZED_ACCESS });
    }

    if (!artist_id) {
        return res.status(400).json({ message: BAD_REQUEST });
    }

    try {
        const artist = await Artists.findById(artist_id);

        if (!artist) {
            return res.status(404).json({ message: ARTIST_NOT_FOUND });
        }

        const userRole = req.user.role;
        if (userRole !== 'admin') {
            return res.status(403).json({ message: FORBIDDEN_ACCESS });
        }

        const artistName = artist.name;
        const artistId = artist._id;

        await Artists.deleteOne({ _id: artistId });

        return res.status(200).json({
            status: 200,
            data: { artist_id: artistId },
            message: `Artist: ${artistName} deleted successfully.`,
            error: null,
        });
    } catch (err) {
        return res.status(500).json({
            message: INTERNAL_ERROR,
            error: err.message || err.error,
        });
    }
};

export const getArtist = async (req, res) => {
    const { artist_id } = req.params;
    try {
        const artist = await Artists.findById(artist_id);

        if (!artist) {
            return res.status(404).json({ message: ARTIST_NOT_FOUND });
        }

        const userRole = req.user.role;
        if (userRole !== 'admin' && artist.hidden) {
            return res.status(403).json({ message: FORBIDDEN_ACCESS });
        }

        return res.status(200).json({
            status: 200,
            data: {
                artist_id: artist._id,
                name: artist.name,
                grammy: artist.grammy,
                hidden: artist.hidden,
            },
            message: "Artist retrieved successfully.",
            error: null,
        });
    } catch (err) {
        return res.status(500).json({
            message: INTERNAL_ERROR,
            error: err.message || err.error,
        });
    }
};
