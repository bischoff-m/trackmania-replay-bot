import { handleFetchNewFlag } from '@/routes/fetchNewFlag'
import { handleFetchNewMap } from '@/routes/fetchNewMap'
import { handleSetComposition } from '@/routes/setComposition'
import cors from 'cors'
import express from 'express'
import serveIndex from 'serve-index'

const PORT = Number(process.env.PORT_EXPRESS?.replace(/;/g, '')) || 4000

const app = express()
app.use(cors())
app.use(express.json())

// Serve static files
app.use(
  '/public',
  express.static('public'),
  serveIndex('public', { icons: true, view: 'details' })
)

// Routes
app.post('/setComposition', handleSetComposition)
app.get('/', (req, res) => res.redirect('/public'))

// Fall-through if static data is not available
app.get('/public/flags/:flagID.jpg', handleFetchNewFlag)
app.get('/public/maps/:mapID/info.json', handleFetchNewMap)
app.get('/public/maps/:mapID/thumbnail.(png|jpg|jpeg)', (req, res) => {
  res.setHeader('Content-Type', 'text/plain')
  res.status(400).send('No thumbnail available. Please fetch the map first.')
})

app.listen(PORT, () => {
  console.log(`Express server started. URL: http://localhost:${PORT}`)
})
