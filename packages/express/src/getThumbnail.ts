import { userAgent } from '@/index'
import { routes, type GetMapInfoResponse } from '@global/api'
import { MapData } from '@global/types'
import type { Request, Response } from 'express'
import fs from 'fs'
import nodeFetch from 'node-fetch'
import path from 'path'

const cacheRoot = path.join(process.cwd(), '/public/maps')

async function fetchNewThumbnail(mapID: string): Promise<string> {
  // Get map info
  const fetchRes = await fetch(routes.getMapInfo.url(mapID))
  const infoResponse = (await fetchRes.json()) as GetMapInfoResponse
  if (!infoResponse.success) throw new Error(infoResponse.error)
  const map = infoResponse.data as MapData

  // Fetch thumbnail image from website
  const response = await nodeFetch(map.thumbnailUrl, {
    headers: { 'User-Agent': userAgent },
  })
  if (!response.ok || response.body === null)
    throw new Error(`Failed to fetch ${map.thumbnailUrl}`)

  // Create cache directory if it doesn't exist
  if (!fs.existsSync(path.join(cacheRoot, `/${mapID}`)))
    fs.mkdirSync(path.join(cacheRoot, `/${mapID}`))

  // Write to cache
  const extension = path.extname(map.thumbnailUrl)
  const filePath = path.join(cacheRoot, `/${mapID}/thumbnail${extension}`)
  await fs.promises.writeFile(filePath, response.body)

  return filePath
}

export async function handleGetThumbnail(req: Request, res: Response) {
  // Set header Access-Control-Allow-Origin to allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*')

  // Check if map ID is provided
  if (!Object.hasOwn(req.params, 'mapID')) {
    res.status(400).send('No map ID provided')
    return
  }

  // Check if map ID is valid
  const mapID = req.params.mapID
  if (!mapID.match(/^[a-zA-Z0-9_-]{27}$/)) {
    res.status(400).send('Invalid map ID')
    return
  }

  // Try to load from cache
  // Find thumbnail file in cache (could be .jpg, .png, ...)
  const dirPath = path.join(cacheRoot, `/${mapID}`)
  if (fs.existsSync(dirPath))
    for (const file of fs.readdirSync(dirPath)) {
      if (!file.match(/^thumbnail\.(jpg|png|jpeg)$/)) continue

      const filePath = path.join(dirPath, `/${file}`)
      res.sendFile(filePath)
      return
    }

  // Fetch new thumbnail
  console.log(`Fetching new thumbnail ${mapID}`)
  try {
    const filePath = await fetchNewThumbnail(mapID)
    res.status(200).sendFile(filePath)
    console.log('Fetch successful')
  } catch (error) {
    console.error(error)
    res.status(500).send('Failed to fetch thumbnail')
  }
}
