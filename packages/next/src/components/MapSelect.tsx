import AddMapInput from '@/components/AddMapInput'
import MapList from '@/components/MapList'
import MapListItem from '@/components/MapListItem'
import { GetCachedMapsResponse, GetMapInfoResponse, routes } from '@global/api'
import { MapData } from '@global/types'
import { Center, Flex, Text, useMantineTheme } from '@mantine/core'
import { useListState } from '@mantine/hooks'
import { IconCaretUp } from '@tabler/icons-react'
import { useEffect } from 'react'
import { DragDropContext, OnDragEndResponder } from 'react-beautiful-dnd'

export default function MapSelect() {
  const theme = useMantineTheme()
  const [mapsCached, handlersCached] = useListState<MapData>([])
  const [mapsActive, handlersActive] = useListState<MapData>([])

  const fixedStyles = {
    width: 700,
    itemHeight: 70,
    separatorHeight: 24,
    separatorColor: theme.colors.dark[8],
    borderRadius: theme.radius.md,
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
        <Flex direction='column' className='flex-1'>
          <MapList
            maps={mapsActive}
            droppableId='listActive'
            itemHeight={fixedStyles.itemHeight}
            rootStyles={{
              // The placeholder expects the width to be set
              width: fixedStyles.width,
              borderTopLeftRadius: fixedStyles.borderRadius,
              borderTopRightRadius: fixedStyles.borderRadius,
            }}
          >
            {mapsActive.map((map, index) => (
              <MapListItem
                key={map.id}
                map={map}
                index={index}
                width={fixedStyles.width}
                itemHeight={fixedStyles.itemHeight}
              />
            ))}
          </MapList>
          <Center
            style={{
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
          <MapList
            maps={mapsCached}
            droppableId='listCache'
            itemHeight={fixedStyles.itemHeight}
            rootStyles={{
              // The placeholder expects the width to be set
              width: fixedStyles.width,
              borderBottomLeftRadius: fixedStyles.borderRadius,
              borderBottomRightRadius: fixedStyles.borderRadius,
            }}
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
        </Flex>
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
            } catch (error) {
              // TODO: Show error in UI
              console.error(error)
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
