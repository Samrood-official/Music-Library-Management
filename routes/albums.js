import { Router } from 'express'
import verifyToken from '../middleware/verifyToken.js'
import { getAlbums, addAlbum, getAlbum, updateAlbum, deleteAlbum} from '../controllers/albums.js'

const router = Router()

router.get('/', verifyToken, getAlbums)
router.post('/add-album', verifyToken, addAlbum)
router.get('/:album_id', verifyToken, getAlbum)
router.put('/:album_id', verifyToken, updateAlbum)
router.delete('/:album_id', verifyToken, deleteAlbum)

export default router;
