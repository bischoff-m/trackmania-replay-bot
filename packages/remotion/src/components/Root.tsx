import { MainComposition } from '@/components/MainComposition'
import '@/style.css'
import { api } from '@global/api'
import type { CompositionData, MapData } from '@global/types'
import React, { useEffect, useState } from 'react'
import {
  Composition,
  cancelRender,
  continueRender,
  delayRender,
  getInputProps,
} from 'remotion'

// Though it is recommended to load data in the Composition component, instead
// of the Root component, I am loading the data here because I need to know the
// duration of the composition before rendering it.
// https://www.remotion.dev/docs/troubleshooting/defaultprops-too-big#how-to-fix-the-error

export const RemotionRoot: React.FC = () => {
  const [compData, setCompData] = useState<CompositionData | null>(null)
  const [maps, setMaps] = useState<{
    [mapID: string]: MapData
  } | null>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [framerate, setFramerate] = useState<number | null>(null)
  const [resolution, setResolution] = useState<[number, number] | null>(null)
  const [handleCompData] = useState(() => delayRender())
  const [handleMaps] = useState(() => delayRender())
  const [handleProps] = useState(() => delayRender())

  const inputPropsCLI = getInputProps() as { data: CompositionData }

  // If props are given from CLI, use them
  // Else, fetch the active composition that is set in the database
  useEffect(() => {
    if (Object.keys(inputPropsCLI).length > 0) setCompData(inputPropsCLI.data)
    else {
      api
        .getComposition()
        .then((newCompData) => {
          setCompData(newCompData)

          continueRender(handleCompData)
        })
        .catch((err) => {
          console.error(err)
          cancelRender(err)
        })
    }
  }, [])

  // Fetch all maps and call setMaps
  useEffect(() => {
    api
      .getMapIndex()
      .then((mapIDs) => Promise.all(mapIDs.map((id) => api.getMap(id))))
      .then((maps) => {
        setMaps(
          maps.reduce<{ [mapID: string]: MapData }>((acc, map) => {
            acc[map.id] = map
            return acc
          }, {})
        )

        continueRender(handleMaps)
      })
      .catch((err) => {
        console.error(err)
        cancelRender(err)
      })
  }, [])

  // Calculate framerate and resolution
  useEffect(() => {
    if (compData === null || maps === null) return

    // Check if all clips have the same resolution and framerate
    // Result is either null or an object with the properties resolution and framerate
    const distinctProps = Object.values(compData.clips)
      .filter((clip) => maps[clip.mapID].video)
      .map((clip) => maps[clip.mapID].video)
      .reduce<{
        resolution: [number, number]
        framerate: number
      } | null>((acc, video) => {
        if (!video) return acc
        if (acc === null)
          return {
            resolution: video.resolution,
            framerate: video.framerate,
          }
        if (
          acc.resolution[0] !== video.resolution[0] ||
          acc.resolution[1] !== video.resolution[1] ||
          acc.framerate !== video.framerate
        )
          throw new Error(
            'All clips must have the same framerate and resolution'
          )
        return acc
      }, null)

    // If all clips have the same resolution and framerate, set them
    if (distinctProps !== null) {
      setFramerate(distinctProps.framerate)
      setResolution(distinctProps.resolution)
    } else {
      cancelRender('The active composition does not contain a clip with video.')
    }

    // Calculate duration
    const duration = Object.values(compData.clips).reduce((acc, clipData) => {
      const map = maps[clipData.mapID]
      const videoDuration = map.video
        ? Math.ceil(
            (map.video.durationInFrames * compData.framerate) /
              map.video.framerate
          )
        : compData.framerate
      return (
        acc + videoDuration + compData.introDurationSeconds * compData.framerate
      )
    }, 0)
    setDuration(duration)

    continueRender(handleProps)
  }, [compData, maps])

  return (
    <>
      {compData !== null &&
        duration !== null &&
        framerate !== null &&
        resolution !== null && (
          <Composition
            id='MainComposition'
            component={MainComposition}
            durationInFrames={duration}
            fps={compData.framerate}
            width={compData.resolution[0]}
            height={compData.resolution[1]}
            defaultProps={{ data: compData }}
          />
        )}
    </>
  )
}
