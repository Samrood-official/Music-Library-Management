import express from 'express'
import userRoutes from './routes/user.js'
import artistRoutes from './routes/artist.js'
import tracksRoutes from './routes/tracks.js'
import albumsRoutes from './routes/albums.js'
import authRoutes from './routes/auth.js'
import favoritesRotes from './routes/favorites.js'
import createConnection from './db/db.js'
import dotenv from 'dotenv'
import bodyParser from 'body-parser';

dotenv.config()
const app = express()
createConnection(process.env.MONGO_URI)

app.use(bodyParser.json())
app.use('/', authRoutes)
app.use('/users', userRoutes)
app.use('/artists', artistRoutes)
app.use('/tracks', tracksRoutes)
app.use('/albums', albumsRoutes)
app.use('/favorites', favoritesRotes)

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`server running succesfully on port ${port}`);
})
