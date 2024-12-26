import { Router } from 'express'
import verifyToken from '../middleware/verifyToken.js'
import { createTrack, getTracks, updateTrack, deleteTrack, getTrack } from '../controllers/track.js';

const router = Router()

router.get('/', verifyToken, getTracks)
router.get('/:track_id', verifyToken, getTrack)
router.post('/add-track', verifyToken, createTrack)
router.put('/:track_id', verifyToken, updateTrack)
router.delete('/:track_id', verifyToken, deleteTrack)

export default router;
