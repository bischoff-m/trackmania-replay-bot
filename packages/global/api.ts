import { MapData } from './types'

const PORT_EXPRESS = Number(process.env.PORT_EXPRESS?.replace(/;/g, '')) || 4000

export const routes = {
  getMapInfo: {
    path: '/getMapInfo/:mapID',
    url: (mapID: string) =>
      `http://localhost:${PORT_EXPRESS}/getMapInfo/${mapID}`,
  },
  getThumbnail: {
    path: '/getThumbnail/:mapID',
    url: (mapID: string) =>
      `http://localhost:${PORT_EXPRESS}/getThumbnail/${mapID}`,
  },
  getCachedMaps: {
    path: '/getCachedMaps',
    url: () => `http://localhost:${PORT_EXPRESS}/getCachedMaps`,
  },
  getFlag: {
    path: '/getFlag/:flagID',
    url: (flagID: string) =>
      `http://localhost:${PORT_EXPRESS}/getFlag/${flagID}`,
  },
}

// Express API
export type GetCachedMapsResponse = {
  [mapID: string]: MapData
}
