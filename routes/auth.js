import { Router } from 'express'
import { login, logout, register } from '../controllers/auth.js'

const router = Router()

router.post('/signup', register)
router.post('/login', login)
router.get('/logout', logout)
router.get('/', (req, res)=> {
    res.send("hello world ")
})

export default router;
