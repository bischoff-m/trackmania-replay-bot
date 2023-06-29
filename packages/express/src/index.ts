import { handleGetActive } from '@/routes/getActive'
import { handleGetCachedMaps } from '@/routes/getCachedMaps'
import { handleGetFlag } from '@/routes/getFlag'
import { handleGetMapInfo } from '@/routes/getMapInfo'
import { handleGetThumbnail } from '@/routes/getThumbnail'
import { handleSetActive } from '@/routes/setActive'
import { routes } from '@global/api'
import cors from 'cors'
import express from 'express'

const PORT = Number(process.env.PORT_EXPRESS?.replace(/;/g, '')) || 4000

export const userAgent = `
trackmania-replay-bot
https://github.com/bischoff-m/trackmania-replay-bot
Discord: bischoff.m
`
  .trim()
  .replaceAll('\n', ' | ')

const app = express()

app.use(express.json())
app.use(cors())

app.get(routes.getMapInfo.path, handleGetMapInfo)
app.get(routes.getThumbnail.path, handleGetThumbnail)
app.get(routes.getCachedMaps.path, handleGetCachedMaps)
app.get(routes.getFlag.path, handleGetFlag)
app.get(routes.getActiveComposition.path, handleGetActive)
app.post(routes.setActiveComposition.path, handleSetActive)

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.status(200).send(
    '<h1>Available routes:</h1>' +
      Object.values(routes)
        .map((route) => route.path)
        .join('<br>')
  )
})

app.listen(PORT, () => {
  console.log(`Express server started. URL: http://localhost:${PORT}`)
})
