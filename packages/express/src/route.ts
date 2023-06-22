import { exampleReplays } from '@global/examples'
import type { MapData } from '@global/types'
import type { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import TrackmaniaIO from 'trackmania.io'

/*
TODO
- Write trackmania.io data to file
- Serve file to remotion
*/

// TEMPLATE
// let test = {
//   mapName: 'Test Map',
//   mapAuthor: 'Test Author',
//   mapAuthorNation: 'FRA',
//   medals: {
//     author: 7528,
//     gold: 8000,
//     silver: 11000,
//     bronze: 14000,
//   },
//   leaderboard: [
//     {
//       name: 'ASdaS-BLR',
//       time: 7431,
//       nation: 'ITA',
//     },
//     {
//       name: 'zzzzznot7_Harry',
//       time: 7431,
//       nation: 'ENG',
//     },
//   ],
//   thumbnailFile: '/remotion/Thumbnail.jpg',
//   uploadedAt: new Date('2021-01-01T00:00:00.000Z'),
// }

async function fetchNewMapData(mapID: string): Promise<MapData> {
  // Initialize client
  const client = new TrackmaniaIO.Client()
  client.setUserAgent(
    'trackmania-replay-bot (https://github.com/bischoff-m/trackmania-replay-bot) | Discord: bischoff.m'
  )
  // Fetch map and leaderboard
  let map = await client.maps.get('z28QXoFnpODEGgg8MOederEVl3j')
  console.log(String(map))
  return {} as MapData

  // await map.leaderboardLoadMore(10)

  // const getLeaderboard = async (): Promise<Ranking[]> => {
  //   let tempLeaderboard: { [position: number]: Ranking } = {}
  //   for (let entry of map.leaderboard) {
  //     let player = await entry.player()
  //     tempLeaderboard[entry.position] = {
  //       name: entry.playerName,
  //       time: entry.time,
  //       nation: player.zone.map((z) => z.name).join(', '),
  //     }
  //   }
  //   try {
  //     let result = []
  //     for (let i = 1; i <= 10; i++) result.push(tempLeaderboard[i])
  //     return result
  //   } catch (error) {
  //     console.log('Error while fetching leaderboard')
  //     console.log(error)
  //     console.log(JSON.stringify(tempLeaderboard))
  //     return []
  //   }
  // }

  // let result: MapData = {
  //   mapName: client.stripFormat(map.name),
  //   mapAuthor: map.authorName,
  //   mapAuthorNation: (await map.author()).zone.map((z) => z.name).join(', '),
  //   medals: {
  //     author: map.medalTimes.author,
  //     gold: map.medalTimes.gold,
  //     silver: map.medalTimes.silver,
  //     bronze: map.medalTimes.bronze,
  //   },
  //   leaderboard: await getLeaderboard(),
  //   thumbnailFile: map.thumbnailCached,
  //   uploadedAt: map.uploaded,
  // }

  // return result
}

// Cache map data in file system
async function loadMapData(
  mapID: string,
  overwriteCache: boolean = false
): Promise<MapData> {
  let filePath = path.join(process.cwd(), `/public/map-data/${mapID}.json`)
  // Check if file exists
  if (!overwriteCache && fs.existsSync(filePath)) {
    console.log(`Loading cached data for map ${mapID}`)
    // Read file into MapData object
    let file = fs.readFileSync(filePath, 'utf8')
    let mapData = JSON.parse(file) as MapData
    return mapData
  } else {
    console.log(`Fetching new data for map ${mapID}`)
    // return {} as MapData
    // Fetch new data
    let mapData = await fetchNewMapData(mapID)
    // Write to file
    fs.writeFileSync(filePath, JSON.stringify(mapData))
    return mapData
  }
}

export async function handleIndex(req: Request, res: Response) {
  res.send(JSON.stringify(exampleReplays))
  return

  const data = await loadMapData('<ID HERE>')
  console.log(data)

  res.send(JSON.stringify(data))
}
