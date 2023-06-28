import MapList from '@/components/MapList'
import MapListItem from '@/components/MapListItem'
import { GetCachedMapsResponse, routes } from '@global/api'
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
        style={{ width: fixedStyles.width, boxShadow: '0 0 10px #0004' }}
      >
        <MapList
          maps={mapsActive}
          droppableId='listActive'
          width={fixedStyles.width}
          itemHeight={fixedStyles.itemHeight}
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
          width={fixedStyles.width}
          itemHeight={fixedStyles.itemHeight}
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
    </DragDropContext>
  )
}
