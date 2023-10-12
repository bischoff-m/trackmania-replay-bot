export type CompositionData = {
  clips: ClipData[]
  introDurationSeconds: number
  resolution: [number, number]
  framerate: number
}

export type ClipData = {
  mapID: string
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
  uploadedAt: Date
  timestamp: Date
  exchangeID?: string
  ghostUrl?: string
  replayUrl?: string
  video?: {
    url: string
    durationInFrames: number
    resolution: [number, number]
    framerate: number
  }
  // playerCount: number | [number, number] // TODO: Where to get this from?
}

export type Ranking = {
  name: string
  time: number
  nation: string
}

export type Settings = {
  trackmaniaRoot: string
}
