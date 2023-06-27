'use client'

import theme from '@/theme'
import { routes, type GetCachedMapsResponse } from '@global/api'
import { MapData } from '@global/types'
import { AppShell, Avatar, Group, MantineProvider, Text } from '@mantine/core'
import { useListState } from '@mantine/hooks'
import { useEffect } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'

/*
TODO
- Write function to open remotion preview
*/

// bqADnHDhKOfimntdyJnyu_ltVhj
// FngQSpNTy0ONQre0XDU9oAdEK7b
// ho7WKyIBTV_dNmP9hFFadUvvtLd

export default function Home() {
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

  const itemsCached = mapsCached.map((map, index) => (
    <Draggable key={map.id} index={index} draggableId={map.id}>
      {(provided, snapshot) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <Group
            noWrap
            p='xs'
            className={
              (snapshot.isDragging ? ' shadow-xl' : '') +
              `rounded-lg transition-all duration-300 hover:shadow-md hover:transition-none`
            }
          >
            <Avatar
              src={routes.getThumbnail.url(map.id)}
              radius='md'
              size='lg'
            />
            <div className='flex-1'>
              <Text size='md' weight={500}>
                {map.name}
              </Text>
              <Text size='sm' color='dimmed' weight={400}>
                {map.authorName}
              </Text>
            </div>
          </Group>
        </div>
      )}
    </Draggable>
  ))

  const itemsActive = mapsActive.map((map, index) => (
    <Draggable key={map.id} index={index} draggableId={map.id}>
      {(provided, snapshot) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <Group
            noWrap
            p='xs'
            className={
              (snapshot.isDragging ? ' shadow-xl' : '') +
              `rounded-lg transition-all duration-300 hover:shadow-md hover:transition-none`
            }
          >
            <Text size='md' weight={500} className='m-2'>
              {index + 1}
            </Text>
            <Avatar
              src={routes.getThumbnail.url(map.id)}
              radius='md'
              size='lg'
            />
            <div className='flex-1'>
              <Text size='md' weight={500}>
                {map.name}
              </Text>
              <Text size='sm' color='dimmed' weight={400}>
                {map.authorName}
              </Text>
            </div>
          </Group>
        </div>
      )}
    </Draggable>
  ))

  return (
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <AppShell>
        <div className='flex w-full h-full justify-end'>
          <div className='flex h-full flex-col'>
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
              <Droppable droppableId='listActive' direction='vertical'>
                {(provided) => (
                  <div
                    className='bg-neutral-800 p-2 rounded-md'
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {itemsActive}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              <br />
              <Droppable droppableId='listCache' direction='vertical'>
                {(provided) => (
                  <div
                    className='bg-neutral-800 p-2 rounded-md flex-1'
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {itemsCached}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </AppShell>
    </MantineProvider>
  )
}
