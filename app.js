import express from 'express'
import userRoutes from './routes/user.js'
import artistRoutes from './routes/artist.js'
import tracksRoutes from './routes/tracks.js'
import albumsRoutes from './routes/albums.js'
import authRoutes from './routes/auth.js'
import favoritesRoutes from './routes/favorites.js'
import createConnection from './db/db.js'
import dotenv from 'dotenv'
import bodyParser from 'body-parser';
import { createServer } from 'http'

dotenv.config()
const app = express()
createConnection(process.env.MONGO_URI)

const httpServer = createServer(app);
console.log("server ======")
app.use(bodyParser.json())
app.use('/', authRoutes)
app.use('/users', userRoutes)
app.use('/artists', artistRoutes)
app.use('/tracks', tracksRoutes)
app.use('/albums', albumsRoutes)
app.use('/favorites', favoritesRoutes)

const port = process.env.PORT || 3000

httpServer.listen(port, () => {
    console.log(`server running succesfully on port ${port}`);
})
