import type { GetCachedMapsResponse } from '@global/api'
import type { MapData } from '@global/types'
import type { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

const cacheRoot = path.join(process.cwd(), '/public/maps')

export async function handleGetCachedMaps(
  req: Request,
  res: Response<GetCachedMapsResponse>
) {
  // Set header Access-Control-Allow-Origin to allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*')

  // Build object of type { [mapID: string]: MapData } from cache
  const cachedMaps: GetCachedMapsResponse = {}
  const maps = fs.readdirSync(cacheRoot)
  for (const mapID of maps) {
    const filePath = path.join(cacheRoot, `/${mapID}/info.json`)
    const file = fs.readFileSync(filePath, 'utf-8')
    const mapData = JSON.parse(file) as MapData
    cachedMaps[mapID] = mapData
  }

  res.status(200).send(cachedMaps)
}
