import { CompositionData, MapData } from './types'

const PORT_EXPRESS = Number(process.env.PORT_EXPRESS?.replace(/;/g, '')) || 4000

export const api = {
  getMapIndex: (): Promise<string[]> =>
    genericGetRoute<string[]>(
      `http://localhost:${PORT_EXPRESS}/public/mapIndex.json`
    ),
  getComposition: (): Promise<CompositionData> =>
    genericGetRoute<CompositionData>(
      `http://localhost:${PORT_EXPRESS}/public/activeComposition.json`
    ),
  getMap: (mapID: string): Promise<MapData> =>
    genericGetRoute<MapData>(
      `http://localhost:${PORT_EXPRESS}/public/maps/${mapID}/info.json`
    ),
  setComposition: (compData: CompositionData): Promise<void> =>
    genericPostRoute(
      `http://localhost:${PORT_EXPRESS}/setComposition`,
      compData
    ),
}

async function genericGetRoute<T>(url: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(await response.text())
  return (await response.json()) as T
}

async function genericPostRoute(url: string, body: any) {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) throw new Error(await response.text())
}

// Used for when fetching is not done manually (e.g. <img src="...">)
export function formatStaticUrl(subPath: string) {
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/URL
  return new URL(subPath, `http://localhost:${PORT_EXPRESS}/`).href
}

export function formatFlagUrl(nation: string) {
  return formatStaticUrl(`public/flags/${nation}.jpg`)
}
