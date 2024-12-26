import { Router } from 'express'
import { getUsers, addUser, deleteUser, updatePassword } from '../controllers/user.js'
import verifyToken from '../middleware/verifyToken.js'

const router = Router()

router.get('/', verifyToken, getUsers)

router.post('/add-user', verifyToken, addUser)

router.put('/update-password', verifyToken, updatePassword)

router.delete('/:user_id', verifyToken, deleteUser)

export default router;
