import MapList from '@/components/MapList'
import MapListItem from '@/components/MapListItem'
import { GetCachedMapsResponse, routes } from '@global/api'
import { MapData } from '@global/types'
import { Center, Flex, useMantineTheme } from '@mantine/core'
import { useListState } from '@mantine/hooks'
import { IconCaretUp } from '@tabler/icons-react'
import { useEffect } from 'react'
import { DragDropContext } from 'react-beautiful-dnd'

export default function MapSelect() {
  const theme = useMantineTheme()
  const [mapsCached, handlersCached] = useListState<MapData>([])
  const [mapsActive, handlersActive] = useListState<MapData>([])

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
    <DragDropContext
      onDragEnd={({ destination, source }) => {
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
      }}
    >
      <Flex
        direction='column'
        className='bg-neutral-800'
        style={{ boxShadow: '0 0 10px #0004' }}
      >
        <MapList maps={mapsActive} droppableId='listActive'>
          {mapsActive.map((map, index) => (
            <MapListItem key={map.id} map={map} index={index} />
          ))}
        </MapList>
        <Center style={{ height: 24, backgroundColor: theme.colors.dark[7] }}>
          <IconCaretUp />
        </Center>
        <MapList maps={mapsCached} droppableId='listCache' grow>
          {mapsCached.map((map, index) => (
            <MapListItem key={map.id} map={map} index={index} />
          ))}
        </MapList>
      </Flex>
    </DragDropContext>
  )
}
