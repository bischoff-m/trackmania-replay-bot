import { userAgent } from '@/index'
import type { GetMapInfoResponse } from '@global/api'
import type { MapData, Ranking } from '@global/types'
import type { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import TrackmaniaIO from 'trackmania.io'
import type Player from 'trackmania.io/typings/structures/Player'

const cacheRoot = path.join(process.cwd(), '/public/maps')

async function fetchNewMapData(mapID: string): Promise<MapData> {
  // Initialize client
  const client = new TrackmaniaIO.Client()
  client.setUserAgent(userAgent)

  // Fetch map and leaderboard
  const map = await client.maps.get(mapID)
  await map.leaderboardLoadMore(10)

  // Examples for player.zone:
  // [Lubeck, Schleswig-Holstein, GER, europe, WOR]
  // [dolnoslaskie, POL, europe, WOR]
  // [NOR, europe, WOR]
  const getNation = (player: Player): string => {
    try {
      return player.zone[player.zone.length - 3].flag
    } catch (error) {
      return 'UNKNOWN'
    }
  }

  const getLeaderboard = async (): Promise<Ranking[]> => {
    const tempLeaderboard: { [position: number]: Ranking } = {}
    try {
      for (let entry of map.leaderboard) {
        const player = await entry.player()
        tempLeaderboard[entry.position] = {
          name: entry.playerName,
          time: entry.time,
          nation: getNation(player),
        }
      }
      const result = []
      for (let i = 1; i <= 10; i++) result.push(tempLeaderboard[i])
      return result
    } catch (error) {
      console.log('Error while fetching leaderboard')
      console.log(error)
      console.log(JSON.stringify(tempLeaderboard))
      return []
    }
  }

  const result: MapData = {
    id: mapID,
    name: client.stripFormat(map.name),
    authorName: map.authorName,
    authorNation: getNation(await map.author()),
    medals: {
      author: map.medalTimes.author,
      gold: map.medalTimes.gold,
      silver: map.medalTimes.silver,
      bronze: map.medalTimes.bronze,
    },
    leaderboard: await getLeaderboard(),
    thumbnailUrl: map.thumbnail,
    mapUrl: map.url,
    uploadedAt: map.uploaded,
    timestamp: new Date(),
  }

  return result
}

// Cache map data in file system
async function loadMapData(
  mapID: string,
  overwriteCache: boolean = false
): Promise<MapData> {
  const filePath = path.join(cacheRoot, `/${mapID}/info.json`)

  // Check if file exists
  if (!overwriteCache && fs.existsSync(filePath)) {
    console.log(`Loading cached data for map ${mapID}`)
    // Read file into MapData object
    const file = fs.readFileSync(filePath, 'utf-8')
    const mapData = JSON.parse(file) as MapData
    return mapData
  } else {
    // Fetch new data
    console.log(`Fetching new data for map ${mapID}`)
    const mapData = await fetchNewMapData(mapID)
    console.log('Fetch successful')

    // Write to file
    if (!fs.existsSync(path.dirname(filePath)))
      fs.mkdirSync(path.dirname(filePath))
    fs.writeFileSync(filePath, JSON.stringify(mapData, null, 2))
    return mapData
  }
}

export async function handleGetMapInfo(
  req: Request,
  res: Response<GetMapInfoResponse>
) {
  // Set header Access-Control-Allow-Origin to allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*')

  // const data = await loadMapData('FngQSpNTy0ONQre0XDU9oAdEK7b') // Minas Morgul
  // const data = await loadMapData('ho7WKyIBTV_dNmP9hFFadUvvtLd') // Forget me not
  // const data = await loadMapData('bqADnHDhKOfimntdyJnyu_ltVhj') // Campaign

  // Check if map ID is provided
  if (!Object.hasOwn(req.params, 'mapID')) {
    res.send({
      success: false,
      data: {},
      error: 'No map ID provided',
    })
    return
  }

  // Check if map ID is valid
  const mapID = req.params.mapID
  if (!mapID.match(/^[a-zA-Z0-9_-]{27}$/)) {
    res.send({
      success: false,
      data: {},
      error: 'Invalid map ID',
    })
    return
  }

  // Try to load map data
  try {
    const data = await loadMapData(mapID)
    res.send({
      success: true,
      data,
      error: '',
    })
  } catch (error: any) {
    res.send({
      success: false,
      data: {},
      error: `${error}`,
    })
  }
}
