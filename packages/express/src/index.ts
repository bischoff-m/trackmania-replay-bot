import { handleGetMapInfo } from '@/getMapInfo'
import express from 'express'

const app = express()

// TODO: Implement getCachedMaps route to display in nextjs

app.get('/getMapInfo/:mapID', handleGetMapInfo)

app.listen(3000, () => {
  console.log('Map Info API is listening on port 3000.')
})
