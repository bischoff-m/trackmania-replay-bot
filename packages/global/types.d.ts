export type CompositionData = {
  clips: { [clipID: string]: ClipData }
  introDurationFrames: number
  framerate: number
  resolution: [number, number]
}

export type ReplayData = { [clipID: string]: ClipData } // TODO: Replace this

export type ClipData = {
  startFrame: number
  durationInFrames: number
  map: MapData
  video?: {
    videoFile: string
    durationInFrames: number
  }
}

export type MapData = {
  id: string
  name: string
  authorName: string
  authorNation: string
  medals: {
    author: number
    gold: number
    silver: number
    bronze: number
  }
  leaderboard: Ranking[]
  thumbnailUrl: string
  mapUrl: string
  uploadedAt: Date
  timestamp: Date
  // playerCount: number | [number, number] // TODO: Where to get this from?
}

export type Ranking = {
  name: string
  time: number
  nation: string
}
