import { handleGetFlag } from '@/getFlag'
import { handleGetMapInfo } from '@/getMapInfo'
import { routes } from '@global/api'
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

// TODO: Implement getCachedMaps route to display in nextjs

app.get(routes.getMapInfo.path, handleGetMapInfo)
app.get(routes.getFlag.path, handleGetFlag)

app.get('/', (req, res) => {
  res.send(
    '<h1>Available routes:</h1>' +
      Object.values(routes)
        .map((route) => route.path)
        .join('<br>')
  )
})

app.listen(PORT, () => {
  console.log(`Express server started. URL: http://localhost:${PORT}`)
})
