import { Router } from 'express'

import verifyToken from '../middleware/verifyToken.js'
import { addFavorite, getFavorites, removeFavorite } from '../controllers/favorites.js';

const router = Router()

router.get('/:category', verifyToken, getFavorites)
router.post('/add-favorite', verifyToken, addFavorite)
router.delete('/remove-favorite/:favorite_id', verifyToken, removeFavorite)

export default router;
