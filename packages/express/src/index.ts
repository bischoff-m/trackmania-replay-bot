import { handleGetFlag } from '@/getFlag'
import { handleGetMapInfo } from '@/getMapInfo'
import express from 'express'

export const userAgent = `
trackmania-replay-bot
https://github.com/bischoff-m/trackmania-replay-bot
Discord: bischoff.m
`
  .trim()
  .replaceAll('\n', ' | ')

const app = express()

// TODO: Implement getCachedMaps route to display in nextjs

app.get('/getMapInfo/:mapID', handleGetMapInfo)
app.get('/getFlag/:flagID', handleGetFlag)

app.get('/', (req, res) => {
  res.send(`
    <h1>Map Info API</h1>
    Available routes:
    <ul>
      <li><a href="/getMapInfo/ho7WKyIBTV_dNmP9hFFadUvvtLd">/getMapInfo/:mapID</a></li>
      <li><a href="/getFlag/FRA">/getFlag/:flagID</a></li>
    </ul>
  `)
})

app.listen(3000, () => {
  console.log('Map Info API server started. URL: http://localhost:3000')
})
