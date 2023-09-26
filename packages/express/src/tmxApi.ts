import { userAgent } from '@/util'
import nodeFetch from 'node-fetch'

// Endpoint: https://trackmania.exchange/api/replays/get_replays/{id}

type GetReplaysResponse = {
  ReplayID: number
  UserID: number
  Username: string
  TrackID: number
  UploadedAt: Date
  ReplayTime: number
  StuntScore: number
  Respawns: number
  Position: number
  Beaten: number
  Percentage: number
  ReplayPoints: number
  NadeoPoints: number
  ExeBuild: string
  PlayerModel: string
}[]

export class TmxApi {
  static async getReplays(id: number, amount: number) {
    const url = `https://trackmania.exchange/api/replays/get_replays/${id}?amount=${amount}`
    const res = await nodeFetch(url, {
      headers: {
        'User-Agent': userAgent,
      },
    })
    if (!res.ok || res.body === null) throw new Error(`Failed to fetch ${url}`)
    return (await res.json()) as GetReplaysResponse
  }

  static async downloadReplay(id: number) {
    const url = `https://trackmania.exchange/replays/download/${id}`
    const res = await nodeFetch(url, {
      headers: { 'User-Agent': userAgent },
    })
    if (!res.ok || res.body === null) throw new Error(`Failed to fetch ${url}`)
    return res.body
  }
}
