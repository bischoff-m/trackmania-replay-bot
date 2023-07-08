import { Clip } from '@/components/Clip'
import { api } from '@global/api'
import type { ClipData, CompositionData, MapData } from '@global/types'
import { createContext, useContext, useEffect, useState } from 'react'
import { AbsoluteFill, continueRender, delayRender } from 'remotion'

export const ClipContext = createContext<ClipContextType | null>(null)

export type ClipContextType = {
  composition: CompositionData
  clip: ClipData
  map: MapData
} | null

// Custom useContext hook to handle null check
// Use this to access the data fetched from trackmania.io
export const useClipContext = () => {
  const context = useContext(ClipContext)
  if (!context) throw new Error('Clip context data not found')
  return context
}

export const MainComposition: React.FC<{
  data: CompositionData | null
}> = ({ data }) => {
  const [maps, setMaps] = useState<MapData[] | null>(null) // One map per clip
  const [handle] = useState(() => delayRender())

  useEffect(() => {
    if (data === null) return
    const mapIDs = Object.values(data.clips).map((clipData) => clipData.mapID)
    Promise.all(mapIDs.map((id) => api.getMap(id)))
      .then((maps) => {
        setMaps(maps)
        continueRender(handle)
      })
      .catch((err) => {
        console.error(err)
      })
  }, [data])

  return (
    <AbsoluteFill>
      {data !== null && maps !== null
        ? Object.values(data.clips).map((clipData, index) => (
            <ClipContext.Provider
              key={index}
              value={{
                composition: data,
                clip: clipData,
                map: maps[index],
              }}
            >
              <Clip />
            </ClipContext.Provider>
          ))
        : null}
    </AbsoluteFill>
  )
}
