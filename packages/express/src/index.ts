import { handleIndex } from '@/route'
import express from 'express'

const userAgent = `
trackmania-replay-bot
https://github.com/bischoff-m/trackmania-replay-bot
Discord: bischoff.m
`
  .trim()
  .replaceAll('\n', ' | ')

const app = express()

app.get('/', handleIndex)

app.listen(3000, () => {
  console.log('Map Info API is listening on port 3000.')
})
