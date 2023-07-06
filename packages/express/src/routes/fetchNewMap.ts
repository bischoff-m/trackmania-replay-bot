import { publicRoot, userAgent, validateMapID } from '@/util'
import type { MapData, Ranking } from '@global/types'
import type { Request, Response } from 'express'
import fs from 'fs'
import nodeFetch from 'node-fetch'
import path from 'path'
import TrackmaniaIO from 'trackmania.io'
import type Player from 'trackmania.io/typings/structures/Player'

// Examples for player.zone:
// [Lubeck, Schleswig-Holstein, GER, europe, WOR]
// [dolnoslaskie, POL, europe, WOR]
// [NOR, europe, WOR]
// This function returns the nation code (GER, POL, NOR, ...) or 'UNKNOWN'
function getNation(player: Player) {
  try {
    return player.zone[player.zone.length - 3].flag
  } catch (error) {
    return 'UNKNOWN'
  }
}

async function fetchNewMapData(mapID: string): Promise<MapData> {
  const result: Partial<MapData> = {}

  // Initialize client
  const client = new TrackmaniaIO.Client()
  client.setUserAgent(userAgent)

  // Fetch map and leaderboard
  const map = await client.maps.get(mapID)
  await map.leaderboardLoadMore(10)

  //////////////////////////////// SIMPLE PROPS ////////////////////////////////
  // Set simple properties
  result.id = mapID
  result.name = client.stripFormat(map.name)
  result.authorName = map.authorName
  result.authorNation = getNation(await map.author())
  result.medals = {
    author: map.medalTimes.author,
    gold: map.medalTimes.gold,
    silver: map.medalTimes.silver,
    bronze: map.medalTimes.bronze,
  }
  result.uploadedAt = map.uploaded
  result.timestamp = new Date()

  ///////////////////////////////// THUMBNAIL  /////////////////////////////////
  // Fetch thumbnail image from website
  const thumbnailRes = await nodeFetch(map.thumbnail, {
    headers: { 'User-Agent': userAgent, Accept: 'image/jpeg, image/png' },
  })
  if (!thumbnailRes.ok || thumbnailRes.body === null)
    throw new Error(`Failed to fetch ${map.thumbnail}`)

  // Write thumbnail to cache
  const thumbUrl = `/maps/${mapID}/thumbnail${path.extname(map.thumbnail)}`
  await fs.promises.writeFile(
    path.join(publicRoot, thumbUrl),
    thumbnailRes.body
  )
  result.thumbnailUrl = '/public' + thumbUrl

  //////////////////////////////// LEADERBOARD  ////////////////////////////////
  // Fetch leaderboard
  const tempLeaderboard: { [position: number]: Ranking } = {}
  for (let entry of map.leaderboard) {
    const player = await entry.player()
    tempLeaderboard[entry.position] = {
      name: entry.playerName,
      time: entry.time,
      nation: getNation(player),
    }
  }
  const rankings: Ranking[] = []
  for (let i = 1; i <= 10; i++) rankings.push(tempLeaderboard[i])
  result.leaderboard = rankings
  //////////////////////////////////////////////////////////////////////////////

  return result as MapData
}

export async function handleFetchNewMap(req: Request, res: Response) {
  if (!validateMapID(req.params, res)) return
  const { mapID } = req.params

  // Try to load map data
  try {
    // Create cache directory if it doesn't exist
    const cacheDir = path.join(publicRoot, `/maps/${mapID}`)
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir)

    // Fetch new data
    console.log(`Fetching new data for map ${mapID}`)
    const mapData = await fetchNewMapData(mapID)
    console.log('Fetch successful')

    // Write map data to cache directory
    const filePath = path.join(publicRoot, `/maps/${mapData.id}/info.json`)
    fs.writeFileSync(filePath, JSON.stringify(mapData, null, 2))

    // Update map index
    const indexFilePath = path.join(publicRoot, '/mapIndex.json')
    if (!fs.existsSync(indexFilePath)) {
      fs.writeFileSync(indexFilePath, JSON.stringify([mapID], null, 2))
    } else {
      const index = JSON.parse(fs.readFileSync(indexFilePath, 'utf-8'))
      if (!index.includes(mapID)) {
        index.push(mapID)
        fs.writeFileSync(indexFilePath, JSON.stringify(index, null, 2))
      }
    }

    res.setHeader('Content-Type', 'application/json')
    res.status(200).send(mapData)
  } catch (error) {
    console.log('Fetch failed')
    res.setHeader('Content-Type', 'text/plain')
    res.status(500).send(String(error))
  }
}
