import Albums from "../models/Albums.js";
import Artists from "../models/Artists.js";
import Favorites from "../models/Favorites.js";
import Tracks from "../models/Tracks.js";
import { generateMissingFieldMessage, INTERNAL_ERROR } from "../utils/common.js";

export const getFavorites = async (req, res) => {
    const { category } = req.params;
    const { limit = 5, offset = 0 } = req.query;

    if (!['artist', 'album', 'track'].includes(category)) {
        return res.status(400).json({
            message: 'Invalid category provided',
        });
    }

    try {
        const favorites = await Favorites.find({ category })
            .skip(parseInt(offset))
            .limit(parseInt(limit));

        if (!favorites.length) {
            return res.status(404).json({
                message: 'No favorites found for this category',
            });
        }

        return res.status(200).json({
            status: 200,
            data: favorites.map(fav => ({
                favorite_id: fav._id,
                category: fav.category,
                item_id: fav.item_id,
                name: fav.name,
                created_at: fav.created_at,
            })),
            message: 'Favorites retrieved successfully.',
            error: null,
        });
    } catch (err) {
        return res.status(500).json({
            message: INTERNAL_ERROR,
            error: err.message || err.error,
        });
    }
};

export const addFavorite = async (req, res) => {
    const { category, item_id } = req.body;
    const missingFields = [];

    if (!category) missingFields.push('category');
    if (!item_id) missingFields.push('item_id');
    if (missingFields.length > 0) {
        const errorMessage = generateMissingFieldMessage(missingFields);
        return res.status(400).json({ message: errorMessage });
    }

    if (!['artist', 'album', 'track'].includes(category)) {
        return res.status(400).json({
            message: 'Invalid category provided. Category must be artist, album, or track.',
        });
    }

    try {
        let item;
        console.log("🚀 ~ addFavorite ~ category:", category)
        if (category === 'artist') {
            item = await Artists.findById(item_id);
        } else if (category === 'album') {
            item = await Albums.findById(item_id);
        } else if (category === 'track') {
            item = await Tracks.findById(item_id);
        }

        if (!item) {
            return res.status(404).json({
                message: `Resource Doesn’t Exist. The provided category ${item_id} is not valid.`,
            });
        }

        const newFavorite = new Favorites({
            category,
            item_id,
            name: item.name,
        });

        await newFavorite.save();

        return res.status(201).json({
            status: 201,
            data: null,
            message: 'Favorite added successfully.',
            error: null,
        });
    } catch (err) {
        return res.status(500).json({
            message: INTERNAL_ERROR,
            error: err.message || err.error,
        });
    }
};

export const removeFavorite = async (req, res) => {
    const { favorite_id } = req.params;

    if (!favorite_id) {
        return res.status(400).json({
            status: 400,
            data: null,
            message: "Invalid favorite ID.",
            error: "Bad Request",
        });
    }

    try {
        const favorite = await Favorites.findByIdAndDelete(favorite_id);

        if (!favorite) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: "Favorite not found.",
                error: "Not Found",
            });
        }

        return res.status(200).json({
            status: 200,
            data: null,
            message: "Favorite removed successfully.",
            error: null,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            data: null,
            message: "Internal Server Error.",
            error: error.message || error,
        });
    }
};
