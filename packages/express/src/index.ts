import { initPublic } from '@/initPublic'
import { handleFetchNewFlag } from '@/routes/fetchNewFlag'
import { handleFetchNewMap } from '@/routes/fetchNewMap'
import { handleMapIndex } from '@/routes/mapIndex'
import { onEvent } from '@/routes/onEvent'
import { handleRenderReplays } from '@/routes/renderReplays'
import { handleSetComposition } from '@/routes/setComposition'
import { handleSetSettings } from '@/routes/setSettings'
import cors from 'cors'
import express, { Response } from 'express'
import serveIndex from 'serve-index'

const PORT = Number(process.env.PORT_EXPRESS?.replace(/;/g, '')) || 4000
initPublic()

const app = express()
app.use(cors())
app.use(express.json())

export type Clients = {
  [id: string]: Response
}

// Server-Sent Events
let clients: Clients = {}
app.get('/events', (req, res) => onEvent(req, res, clients))

// Serve static files
app.use(
  '/public',
  express.static('public', { fallthrough: true }),
  serveIndex('public', { icons: true, view: 'details' })
)

// Routes
app.get('/', (req, res) => res.redirect('/public'))
app.post('/setComposition', handleSetComposition)
app.post('/setSettings', handleSetSettings)
app.get('/mapIndex', handleMapIndex)
app.post('/renderReplays', (req, res) => handleRenderReplays(req, res, clients))

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
