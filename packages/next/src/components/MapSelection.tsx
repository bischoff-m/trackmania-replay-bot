import AddMapInput from '@/components/AddMapInput'
import MapList from '@/components/MapList'
import MapListItem from '@/components/MapListItem'
import { GetCachedMapsResponse, GetMapInfoResponse, routes } from '@global/api'
import { CompositionData, MapData } from '@global/types'
import { Button, Center, Flex, Text, useMantineTheme } from '@mantine/core'
import { useListState } from '@mantine/hooks'
import { IconCaretUp } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { DragDropContext, OnDragEndResponder } from 'react-beautiful-dnd'

export default function MapSelection() {
  const theme = useMantineTheme()
  const [mapsCached, handlersCached] = useListState<MapData>([])
  const [mapsActive, handlersActive] = useListState<MapData>([])
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  const fixedStyles = {
    width: 700,
    itemHeight: 70,
    separatorHeight: 24,
    separatorColor: theme.colors.dark[4],
    borderRadius: theme.radius.md,
  }

  const onClickSave = async () => {
    const curFrame = 0
    const fps = 60
    const introDuration = 5 * fps
    const replayDuration = 450
    const body: CompositionData = {
      // Reduce mapsActive to an object with the map IDs as keys
      clips: mapsActive.reduce((acc, map) => {
        acc[map.id] = {
          startFrame: curFrame,
          durationInFrames: introDuration + replayDuration,
          map: map,
          video: {
            videoFile: '/video-cache/Video1.webm',
            durationInFrames: 450,
          },
        }
        return acc
      }, {} as CompositionData['clips']),
      introDurationFrames: introDuration,
      framerate: fps,
      resolution: [2560, 1440],
    }

    // TODO: Send body to express server
  }

  const onDragEnd: OnDragEndResponder = ({ destination, source }) => {
    if (!destination) return
    const getState = (id: string) =>
      id === 'listCache'
        ? {
            maps: mapsCached,
            handlers: handlersCached,
          }
        : {
            maps: mapsActive,
            handlers: handlersActive,
          }
    const srcState = getState(source.droppableId)
    const desState = getState(destination.droppableId)
    const draggedItem = srcState.maps[source.index]
    srcState.handlers.remove(source.index)
    desState.handlers.insert(destination.index, draggedItem)
    setUnsavedChanges(true)
  }

  useEffect(() => {
    fetch(routes.getCachedMaps.url()).then(async (res) => {
      const newMaps = (await res.json()) as GetCachedMapsResponse

      // Append new maps
      const cachedIDs = mapsCached
        .map((map) => map.id)
        .concat(mapsActive.map((map) => map.id))
      handlersCached.append(
        ...Object.values(newMaps).filter((map) => !cachedIDs.includes(map.id))
      )

      // Remove deleted maps
      const newIDs = Object.keys(newMaps)
      handlersCached.filter((map) => newIDs.includes(map.id))
      handlersActive.filter((map) => newIDs.includes(map.id))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Flex
        direction='column'
        style={{ width: fixedStyles.width }}
        className='m-3 gap-3'
      >
        <Flex
          direction='column'
          className='flex-1 rounded-lg justify-end items-center overflow-hidden'
          style={{
            border: `0.0625rem solid ${theme.colors.dark[4]}`,
            clipPath: 'inset(0 0 0 0)',
          }}
        >
          {/* Active map list */}
          <MapList
            maps={mapsActive}
            droppableId='listActive'
            itemHeight={fixedStyles.itemHeight}
            width={fixedStyles.width}
          >
            {mapsActive.map((map, index) => (
              <MapListItem
                key={map.id}
                map={map}
                index={index}
                width={fixedStyles.width}
                itemHeight={fixedStyles.itemHeight}
                showIndex
              />
            ))}
          </MapList>

          {/* Separator */}
          <Center
            style={{
              width: '100%',
              height: fixedStyles.separatorHeight,
              backgroundColor: fixedStyles.separatorColor,
            }}
          >
            <IconCaretUp />
            <Text size='sm' weight={400} px='md'>
              Set active
            </Text>
            <IconCaretUp />
          </Center>

          {/* Cached map list */}
          <MapList
            maps={mapsCached}
            droppableId='listCache'
            itemHeight={fixedStyles.itemHeight}
            width={fixedStyles.width}
            grow
          >
            {mapsCached.map((map, index) => (
              <MapListItem
                key={map.id}
                map={map}
                index={index}
                width={fixedStyles.width}
                itemHeight={fixedStyles.itemHeight}
              />
            ))}
          </MapList>

          {/* Save button */}
          <Button
            variant='filled'
            style={{
              position: 'absolute',
              transform: unsavedChanges
                ? 'translateY(-30%)'
                : 'translateY(150%)',
              transition: 'transform 0.2s ease',
            }}
            onClick={() => {
              onClickSave()
              setUnsavedChanges(true)
            }}
          >
            Save
          </Button>
        </Flex>

        {/* Input field for new maps */}
        <AddMapInput
          onSubmit={async (mapID) => {
            // Fetch new map
            try {
              // TODO: Turn {success: false, data: null, error: string} into just returning data
              const fetchRes = await fetch(routes.getMapInfo.url(mapID))
              const response = (await fetchRes.json()) as GetMapInfoResponse
              if (!response.success) throw new Error(response.error)
              // TODO: This is unsafe
              handlersCached.append(response.data as MapData)
              console.log(response.data)
              return true
            } catch (error) {
              // TODO: Show error in UI
              console.error(error)
              return false
            }
          }}
          validate={(value) => {
            if (!value.match(/^[a-zA-Z0-9_-]{27}$/)) return 'Invalid map ID'
            if (
              mapsCached.find((map) => map.id === value) ||
              mapsActive.find((map) => map.id === value)
            )
              return 'Map already added'
            return null
          }}
        />
      </Flex>
    </DragDropContext>
  )
}
