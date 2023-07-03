import AddMapInput from '@/components/AddMapInput'
import MapList from '@/components/MapList'
import MapListItem from '@/components/MapListItem'
import SaveActiveMapsButton from '@/components/SaveActiveMapsButton'
import { GetCachedMapsResponse, routes } from '@global/api'
import { CompositionData, MapData } from '@global/types'
import { ActionIcon, Center, Flex, Text, useMantineTheme } from '@mantine/core'
import { useListState } from '@mantine/hooks'
import { IconCaretUp, IconTrash } from '@tabler/icons-react'
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
    background: theme.colors.dark[6],
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
    fetch(routes.getCachedMaps.url(), {
      headers: { Accept: 'application/json' },
    })
      .then(async (resCached) => {
        if (!resCached.ok) throw new Error(await resCached.text())

        const resActive = await fetch(routes.getActiveComposition.url(), {
          headers: { Accept: 'application/json' },
        })
        const compData = (await resActive.json()) as CompositionData
        const loadedMaps = (await resCached.json()) as GetCachedMapsResponse
        const activeIDs = Object.keys(compData.clips)

        let newCached: MapData[] = []
        let newActive: MapData[] = []

        // Append new maps
        Object.values(loadedMaps).forEach((map) => {
          if (activeIDs.includes(map.id)) newActive.push(map)
          else newCached.push(map)
        })
        handlersCached.setState(newCached)
        handlersActive.setState(newActive)
      })
      .catch((err) => {
        console.error(err)
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
        {/* Map lists and separator */}
        <Flex
          direction='column'
          className='flex-1 rounded-lg justify-end items-center overflow-hidden'
          style={{
            border: `0.0625rem solid ${theme.colors.dark[4]}`,
            clipPath: 'inset(0 0 0 0)',
            backgroundColor: fixedStyles.background,
          }}
        >
          <Flex className='w-full p-1 justify-end'>
            <ActionIcon
              size='lg'
              title='Set all inactive'
              color='primary'
              onClick={() => {
                if (mapsActive.length === 0) return
                const newCached = [...mapsActive, ...mapsCached]
                handlersActive.setState([])
                handlersCached.setState(newCached)
                setUnsavedChanges(true)
              }}
            >
              <IconTrash size='1.2rem' />
            </ActionIcon>
          </Flex>

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
          <SaveActiveMapsButton
            mapsActive={mapsActive}
            isActive={unsavedChanges}
            setIsActive={setUnsavedChanges}
          />
        </Flex>

        {/* Input field for new maps */}
        <AddMapInput
          onSubmit={async (mapID) => {
            // Fetch new map
            try {
              const fetchRes = await fetch(routes.getMapInfo.url(mapID), {
                headers: { Accept: 'application/json' },
              })
              if (!fetchRes.ok) throw new Error(fetchRes.statusText)
              const mapData = (await fetchRes.json()) as MapData

              if (!Object.hasOwn(mapData, 'id'))
                throw new Error('Invalid map data')

              handlersCached.append(mapData)
              console.log(mapData)
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
