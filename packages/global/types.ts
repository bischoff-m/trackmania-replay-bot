export type CompositionData = {
  clips: ClipData[]
  introDurationFrames: number
  framerate: number
  resolution: [number, number]
}

export type ClipData = {
  mapID: string
  startFrame: number
  durationInFrames: number
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
  ghostUrl: string
  uploadedAt: Date
  timestamp: Date
  video?: {
    url: string
    durationInFrames: number
  }
  // playerCount: number | [number, number] // TODO: Where to get this from?
}

export type Ranking = {
  name: string
  time: number
  nation: string
}
