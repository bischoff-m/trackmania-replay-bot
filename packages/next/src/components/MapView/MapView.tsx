import { useCompositionFormContext } from '@/components/AppRoot'
import AddMapInput from '@/components/MapView/AddMapInput'
import MapList from '@/components/MapView/MapList'
import MapListItem from '@/components/MapView/MapListItem'
import MapViewHeader from '@/components/MapView/MapViewHeader'
import { api } from '@global/api'
import { ClipData, MapData } from '@global/types'
import { Center, Flex, Text, useMantineTheme } from '@mantine/core'
import { useListState } from '@mantine/hooks'
import { IconCaretUp } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import {
  DragDropContext,
  Draggable,
  OnDragEndResponder,
} from 'react-beautiful-dnd'

export default function MapView() {
  const theme = useMantineTheme()
  const form = useCompositionFormContext()
  const [isDirty, setDirty] = useState(false)
  const [mapsCached, handlersCached] = useListState<MapData>([])
  const [mapsActive, handlersActive] = useListState<MapData>([])

  const fixedStyles = {
    width: 700,
    listItemHeight: 70,
    headerHeight: 42,
    separatorHeight: 24,
    separatorColor: theme.colors.dark[4],
    borderRadius: theme.radius.md,
    background: theme.colors.dark[6],
    itemHoverColor: theme.colors.dark[7],
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
    setDirty(true)
  }

  async function updateForm(setDirty = true) {
    // Calculate clips from activeMaps
    let curFrame = 0
    const introDuration = form.values.introDurationFrames
    const selectedClips = mapsActive.map((mapData) => {
      const fps = form.values.framerate
      const replayDuration = mapData.video?.durationInFrames ?? fps // 1 second
      const clipData: ClipData = {
        mapID: mapData.id,
        startFrame: curFrame,
        durationInFrames: introDuration + replayDuration,
      }
      curFrame += introDuration + replayDuration
      return clipData
    })

    // Compare clips from form with clips from activeMaps
    if (JSON.stringify(form.values.clips) !== JSON.stringify(selectedClips)) {
      form.setFieldValue('clips', selectedClips)
      form.setDirty({ clips: setDirty })
    }
  }

  async function reloadMaps() {
    try {
      // Fetch map index
      const mapIDs = await api.getMapIndex()
      // Get MapData for all maps
      const maps = await Promise.all(mapIDs.map((id) => api.getMap(id)))
      // Get CompositionData for active maps
      const compData = await api.getComposition()
      const activeIDs = compData.clips.map((clip) => clip.mapID)
      // Preserve order of active maps saved in composition
      const activeMaps = activeIDs.map((id) =>
        maps.find((map) => map.id === id)
      )
      // Update state
      handlersCached.setState(maps.filter((map) => !activeIDs.includes(map.id)))
      handlersActive.setState(activeMaps as MapData[])
    } catch (err) {
      console.error('Failed to load maps')
      console.error(err)
    }
  }

  useEffect(() => {
    // Initial load
    reloadMaps()

    // Subscribe to map updates
    const closeHandle = api.onMapsUpdate(reloadMaps)

    return () => {
      // Unsubscribe from map updates
      closeHandle()
    }
  }, [])

  useEffect(() => {
    // Update form to reflect changes
    if (isDirty) {
      updateForm()
      setDirty(false)
    }
  }, [isDirty])

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
          {/* Header */}
          <MapViewHeader
            activeState={[mapsActive, handlersActive]}
            cachedState={[mapsCached, handlersCached]}
            height={fixedStyles.headerHeight}
            setDirty={setDirty}
          />

          {/* Active map list */}
          <MapList
            maps={mapsActive}
            droppableId='listActive'
            itemHeight={fixedStyles.listItemHeight}
            width={fixedStyles.width}
          >
            {mapsActive.map((map, index) => (
              <Draggable key={map.id} index={index} draggableId={map.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                  >
                    <MapListItem
                      key={map.id}
                      map={map}
                      index={index}
                      width={fixedStyles.width}
                      height={fixedStyles.listItemHeight}
                      draggableSnapshot={snapshot}
                      bgColor={fixedStyles.background}
                      hoverColor={fixedStyles.itemHoverColor}
                    />
                  </div>
                )}
              </Draggable>
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
            itemHeight={fixedStyles.listItemHeight}
            width={fixedStyles.width}
            grow
          >
            {mapsCached.map((map, index) => (
              <Draggable key={map.id} index={index} draggableId={map.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                  >
                    <MapListItem
                      key={map.id}
                      map={map}
                      width={fixedStyles.width}
                      height={fixedStyles.listItemHeight}
                      draggableSnapshot={snapshot}
                      bgColor={fixedStyles.background}
                      hoverColor={fixedStyles.itemHoverColor}
                    />
                  </div>
                )}
              </Draggable>
            ))}
          </MapList>
        </Flex>

        {/* Input field for new maps */}
        <AddMapInput
          onSubmit={async (mapID) => {
            // Fetch new map data
            const map = await api.getMap(mapID)
            if (!Object.hasOwn(map, 'id')) throw new Error('Invalid map data')

            handlersCached.append(map)
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
