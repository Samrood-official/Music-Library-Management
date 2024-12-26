import mongoose from "mongoose";
import Albums from "../models/Albums.js";
import Artists from "../models/Artists.js";
import { BAD_REQUEST, FORBIDDEN_ACCESS, generateMissingFieldMessage, INTERNAL_ERROR, isAdmin, RESOURCE_NOT_FOUND, TRUE_STRING } from "../utils/common.js";

export const getAlbums = async (req, res) => {
    const { limit = 5, offset = 0, artist_id, hidden } = req.query;

    const pageLimit = parseInt(limit, 10);
    const pageOffset = parseInt(offset, 10);

    if (isNaN(pageLimit) || isNaN(pageOffset) || pageLimit <= 0 || pageOffset < 0) {
        return res.status(400).json({ message: BAD_REQUEST });
    }

    try {
        let query = {};

        if (artist_id) {
            const artist = await Artists.findById(artist_id);
            if (!artist) {
                return res.status(404).json({ message: ARTIST_NOT_FOUND });
            }
            query.artist_id = artist_id;
        }

        if (hidden !== undefined) {
            query.hidden = hidden === TRUE_STRING;
        }

        const albums = await Albums.find(query)
            .skip(pageOffset)
            .limit(pageLimit);

        return res.status(200).json({
            status: 200,
            data: albums.map(album => ({
                album_id: album._id,
                artist_name: album.artist_name,
                name: album.name,
                year: album.year,
                hidden: album.hidden,
            })),
            message: "Albums retrieved successfully.",
            error: null,
        });
    } catch (err) {
        return res.status(500).json({
            message: INTERNAL_ERROR,
            error: err.message || err.error,
        });
    }
};

export const addAlbum = async (req, res) => {
    const { artist_id, name, year, hidden } = req.body;
    const missingFields = [];

    if (!name) missingFields.push('name');
    if (!year) missingFields.push('year');
    if (!artist_id) missingFields.push('artist_id');

    if (missingFields.length > 0) {
        const errorMessage = generateMissingFieldMessage(missingFields);
        return res.status(400).json({ message: errorMessage });
    }

    try {
        const artist = await Artists.findById(artist_id);
       
        if (!artist) {
            return res.status(404).json({ message: RESOURCE_NOT_FOUND });
        }
        const isNameUsed = await Albums.findOne({name});

        if(isNameUsed) {
            return res.status(409).json({ message: 'Album name is already used' });
        }
        const album = new Albums({
            artist_id,
            name,
            year,
            hidden,
        });

        await album.save();

        return res.status(201).json({
            status: 201,
            data: null,
            message: "Album created successfully.",
            error: null,
        });
    } catch (err) {
        return res.status(500).json({
            message: INTERNAL_ERROR,
            error: err.message || err.error,
        });
    }
};


export const getAlbum = async (req, res) => {
    const { album_id } = req.params;

    try {
        const album = await Albums.findById(album_id);

        if (!album) {
            return res.status(404).json({ message: RESOURCE_NOT_FOUND });
        }

        const userRole = req.user.role;
        if (userRole !== 'admin' && album.hidden) {
            return res.status(403).json({ message: FORBIDDEN_ACCESS });
        }

        return res.status(200).json({
            status: 200,
            data: {
                album_id: album._id,
                artist_name: album.artist_name,
                name: album.name,
                year: album.year,
                hidden: album.hidden,
            },
            message: "Album retrieved successfully.",
            error: null,
        });
    } catch (err) {
        let errorMessage = err;
        if (err instanceof mongoose.Error.CastError) {
            errorMessage = `Invalid ObjectId: ${album_id}. Please check the ID format.`
        }
        return res.status(500).json({
            message: INTERNAL_ERROR,
            error: errorMessage || err.reason || err.message || err.error,
        });
    }
};

export const updateAlbum = async (req, res) => {
    const { album_id } = req.params;
    const { name, year, hidden } = req.body;

    if (!name && !year && !hidden) {
        return res.status(400).json({ message: BAD_REQUEST });
    }

    try {
        const album = await Albums.findById(album_id);
        const isNameUsed = await Albums.findOne({name});
        
        if(isNameUsed) {
            return res.status(409).json({ message: 'Album name is already used' });
        }

        if (!album) {
            return res.status(404).json({ message: RESOURCE_NOT_FOUND });
        }

        const userRole = req.user.role;
        if (userRole !== 'admin' && album.hidden) {
            return res.status(403).json({ message: FORBIDDEN_ACCESS });
        }

        if (name !== undefined) album.name = name;
        if (hidden !== undefined) album.hidden = hidden;
        if (year !== undefined) album.year = year;

        await album.save();

        return res.status(204).json();
    } catch (err) {
        return res.status(500).json({
            message: INTERNAL_ERROR,
            error: err.message || err.error,
        });
    }
};

export const deleteAlbum = async (req, res) => {
    const { album_id } = req.params; 

    try {
        const album = await Albums.findById(album_id);

        if (!album) {
            return res.status(404).json({ message: RESOURCE_NOT_FOUND });
        }

        const userRole = req.user.role;
        if (isAdmin(userRole)) {
            return res.status(403).json({ message: FORBIDDEN_ACCESS });
        }

        await album.deleteOne({ _id: album_id });

        return res.status(200).json({
            status: 200,
            data: null,
            message: `Album: ${album.name} deleted successfully.`,
            error: null,
        });
    } catch (err) {
        return res.status(500).json({
            message: INTERNAL_ERROR,
            error: err.message || err.error,
        });
    }
};
