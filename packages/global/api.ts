import { MapData } from './types'

const PORT_EXPRESS = Number(process.env.PORT_EXPRESS?.replace(/;/g, '')) || 4000

export const routes = {
  getMapInfo: {
    path: '/getMapInfo/:mapID',
    format: (mapID: string) =>
      `http://localhost:${PORT_EXPRESS}/getMapInfo/${mapID}`,
  },
  getFlag: {
    path: '/getFlag/:flagID',
    format: (flagID: string) =>
      `http://localhost:${PORT_EXPRESS}/getFlag/${flagID}`,
  },
}

// Express API
export type GetMapInfoResponse = {
  success: boolean
  data: MapData | {}
  error: string
}
