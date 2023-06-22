export type ReplayData = { [clipID: string]: ClipData }

export type ClipData = {
  startFrame: number
  durationInFrames: number
  map: MapData
  video: {
    videoFile: string
    durationInFrames: number
  }
}

export type MapData = {
  mapName: string
  mapAuthor: string
  mapAuthorNation: string
  medals: {
    author: number
    gold: number
    silver: number
    bronze: number
  }
  leaderboard: Ranking[]
  thumbnailFile: string
  uploadedAt: Date
  timestamp: Date
  // playerCount: number | [number, number] // TODO: Where to get this from?
}

export type Ranking = {
  name: string
  time: number
  nation: string
}

export type GetMapInfoResponse = {
  success: boolean
  data: MapData | {}
  error: string
}
