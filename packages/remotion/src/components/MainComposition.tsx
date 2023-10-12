import { Clip } from '@/components/Clip'
import { api } from '@global/api'
import type { ClipData, CompositionData, MapData } from '@global/types'
import { createContext, useContext, useEffect, useState } from 'react'
import { AbsoluteFill, Sequence, continueRender, delayRender } from 'remotion'

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
}> = ({ data: compData }) => {
  const [maps, setMaps] = useState<MapData[] | null>(null) // One map per clip
  const [handle] = useState(() => delayRender())

  useEffect(() => {
    if (compData === null) return
    const mapIDs = Object.values(compData.clips).map(
      (clipData) => clipData.mapID
    )
    Promise.all(mapIDs.map((id) => api.getMap(id)))
      .then((maps) => {
        setMaps(maps)
        continueRender(handle)
      })
      .catch((err) => {
        console.error(err)
      })
  }, [compData])

  if (compData === null || maps === null) return <></>

  let currentFrame = 0

  return (
    <AbsoluteFill>
      {Object.values(compData.clips).map((clipData, index) => {
        const video = maps[index].video
        const videoDuration = video
          ? Math.ceil(
              (video.durationInFrames * compData.framerate) / video.framerate
            )
          : compData.framerate
        const currentDuration =
          videoDuration + compData.introDurationSeconds * compData.framerate
        const currentFrom = currentFrame
        currentFrame += currentDuration

        return (
          <ClipContext.Provider
            key={index}
            value={{
              composition: compData,
              clip: clipData,
              map: maps[index],
            }}
          >
            <Sequence
              name={'Clip ' + clipData.mapID}
              from={currentFrom}
              durationInFrames={currentDuration}
            >
              <Clip />
            </Sequence>
          </ClipContext.Provider>
        )
      })}
    </AbsoluteFill>
  )
}
