import { MapData } from './types'

const PORT_EXPRESS = Number(process.env.PORT_EXPRESS?.replace(/;/g, '')) || 4000

export const routes = {
  getMapInfo: {
    // Expects: { mapID: string }
    // Returns: MapData
    path: '/getMapInfo/:mapID',
    url: (mapID: string) =>
      `http://localhost:${PORT_EXPRESS}/getMapInfo/${mapID}`,
  },
  getThumbnail: {
    // Expects: { mapID: string }
    // Returns: Content-Type image/jpeg or image/png
    path: '/getThumbnail/:mapID',
    url: (mapID: string) =>
      `http://localhost:${PORT_EXPRESS}/getThumbnail/${mapID}`,
  },
  getCachedMaps: {
    // Expects: nothing
    // Returns: GetCachedMapsResponse
    path: '/getCachedMaps',
    url: () => `http://localhost:${PORT_EXPRESS}/getCachedMaps`,
  },
  getFlag: {
    // Expects: { flagID: string }
    // Returns: Content-Type image/jpeg or image/png
    path: '/getFlag/:flagID',
    url: (flagID: string) =>
      `http://localhost:${PORT_EXPRESS}/getFlag/${flagID}`,
  },
  getActiveComposition: {
    // Expects: nothing
    // Returns: CompositionData
    path: '/getActive',
    url: () => `http://localhost:${PORT_EXPRESS}/getActive`,
  },
  setActiveComposition: {
    // Expects: CompositionData
    // Returns: nothing
    path: '/setActive',
    url: () => `http://localhost:${PORT_EXPRESS}/setActive`,
  },
}

// Express API
export type GetCachedMapsResponse = {
  [mapID: string]: MapData
}
