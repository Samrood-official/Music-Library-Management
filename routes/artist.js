import { Router } from 'express'
import { addArtist, getArtists, updateArtist, deleteArtist, getArtist } from '../controllers/artist.js'
import verifyToken from '../middleware/verifyToken.js'

const router = Router()

router.get('/', verifyToken, getArtists)
router.get('/:artist_id', verifyToken, getArtist)
router.put('/:artist_id', verifyToken, updateArtist)
router.post('/add-artist', verifyToken, addArtist)
router.delete('/:artist_id', verifyToken, deleteArtist)

export default router;
