import MapView from '@/components/MapView/MapView'
import RenderSettings from '@/components/RenderSettings'
import SaveButton from '@/components/SaveButton'
import { api } from '@global/api'
import { ClipData, MapData } from '@global/types'
import { Center, Flex, clsx, useMantineTheme } from '@mantine/core'
import { createFormContext } from '@mantine/form'
import { createContext, useEffect, useState } from 'react'

export type RenderFormState = {
  clips: ClipData[]
  introDurationSeconds: number
  resolution: [number, number]
  framerate: number
}

export type MapDataWithVideo = MapData & Required<Pick<MapData, 'video'>>

const [RenderFormProvider, useRenderFormContext, useRenderForm] =
  createFormContext<RenderFormState>()

export { useRenderFormContext }

type MapsRecord = {
  [mapID: string]: MapData
}
export const MapsContext = createContext<{
  maps: MapsRecord
  reloadMaps: () => Promise<MapsRecord>
}>({
  maps: {},
  reloadMaps: async () => ({}),
})

export default function AppRoot() {
  const theme = useMantineTheme()
  const fixedStyles = {
    background: theme.colors.dark[7],
  }

  const [maps, setMaps] = useState<MapsRecord>({})

  const form = useRenderForm({
    initialValues: {
      clips: [],
      introDurationSeconds: 5,
      resolution: [2560, 1440],
      framerate: 60,
    },
    initialDirty: {
      clips: false,
      introDurationSeconds: false,
      resolution: false,
      framerate: false,
    },
  })

  async function reloadMaps(): Promise<MapsRecord> {
    try {
      // Fetch map index
      const mapIDs = await api.getMapIndex()
      // Get MapData for all maps
      const maps = await Promise.all(mapIDs.map((id) => api.getMap(id)))
      // Update state
      const mapsRecord = maps.reduce<MapsRecord>((acc, map) => {
        acc[map.id] = map
        return acc
      }, {})
      setMaps(mapsRecord)
      return mapsRecord
    } catch (err) {
      console.error('Failed to load maps')
      throw err
    }
  }

  // Initialize form values
  useEffect(() => {
    reloadMaps().then(async (mapsRecord) => {
      const compData = await api.getComposition()
      // Set form values from CompositionData
      form.setValues({
        clips: compData.clips,
        introDurationSeconds: compData.introDurationSeconds,
      })

      // Use the most common resolution and framerate as the default
      const countOccurencesInClips = (
        getKey: (video: MapDataWithVideo['video']) => string
      ) =>
        Object.entries(
          compData.clips.reduce<Record<string, number>>((acc, clip) => {
            const map = mapsRecord[clip.mapID]
            if (!map.video) return acc
            const key = getKey(map.video)
            acc[key] = (acc[key] || 0) + 1
            return acc
          }, {})
        ).sort((a, b) => b[1] - a[1])

      // Count resolutions
      const resolutionFreqs = countOccurencesInClips((video) =>
        video.resolution.join('x')
      )
      // Count framerates
      const framerateFreqs = countOccurencesInClips((video) =>
        String(video.framerate)
      )

      if (resolutionFreqs.length)
        form.setFieldValue(
          'resolution',
          resolutionFreqs[0][0].split('x').map(Number) as [number, number]
        )
      if (framerateFreqs.length)
        form.setFieldValue('framerate', Number(framerateFreqs[0][0]))
    })
  }, [])

  return (
    <main
      className={clsx('h-full', 'w-full', 'top-0', 'left-0', 'fixed')}
      style={{ backgroundColor: fixedStyles.background }}
    >
      <MapsContext.Provider value={{ maps, reloadMaps }}>
        <SaveButton isActive={form.isDirty()} />
        <RenderFormProvider form={form}>
          <Flex className='h-full'>
            <form
              // This is referenced by <Button form='composition-form' ... />
              id='composition-form'
              onSubmit={form.onSubmit(async () => {
                // Send CompositionData to server
                api
                  .setComposition({
                    clips: form.values.clips,
                    introDurationSeconds: form.values.introDurationSeconds,
                    resolution: form.values.resolution,
                    framerate: form.values.framerate,
                  })
                  .then(() => {
                    form.setDirty(
                      Object.keys(form.values).reduce<Record<string, boolean>>(
                        (acc, key) => {
                          acc[key] = false
                          return acc
                        },
                        {}
                      )
                    )
                  })
              })}
            ></form>
            <Center className='flex-1'>
              <RenderSettings />
            </Center>
            <MapView />
          </Flex>
        </RenderFormProvider>
      </MapsContext.Provider>
    </main>
  )
}
