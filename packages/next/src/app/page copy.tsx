'use client'

import theme from '@/theme'
import { routes, type GetCachedMapsResponse } from '@global/api'
import { MapData } from '@global/types'
import {
  AppShell,
  Avatar,
  Checkbox,
  Group,
  MantineProvider,
  Text,
  TransferListItemComponent,
  TransferListItemComponentProps,
} from '@mantine/core'
import { useListState } from '@mantine/hooks'
import { useEffect, useState } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'

/*
TODO
- Write function to open remotion preview
*/

// bqADnHDhKOfimntdyJnyu_ltVhj
// FngQSpNTy0ONQre0XDU9oAdEK7b
// ho7WKyIBTV_dNmP9hFFadUvvtLd

const mockdata = [
  {
    value: 'bqADnHDhKOfimntdyJnyu_ltVhj',
    label: 'Bender Bending Rodríguez',
    image: 'https://img.icons8.com/clouds/256/000000/futurama-bender.png',
    description: 'Fascinated with cooking, though has no sense of taste',
  },

  {
    value: 'FngQSpNTy0ONQre0XDU9oAdEK7b',
    label: 'Carol Miller',
    image: 'https://img.icons8.com/clouds/256/000000/futurama-mom.png',
    description: 'One of the richest people on Earth',
  },
  // ...other items
]

export default function Home() {
  const [maps, setMaps] = useState<GetCachedMapsResponse>({})
  // const [listData, setListData] = useState<TransferListData>([mockdata, []])
  const [mapsCached, handlersCached] = useListState<MapData>([])

  useEffect(() => {
    fetch(routes.getCachedMaps.url()).then(async (res) => {
      const newMaps = (await res.json()) as GetCachedMapsResponse

      // Append new maps
      const cachedIDs = mapsCached.map((map) => map.id)
      handlersCached.append(
        ...Object.values(newMaps).filter((map) => !cachedIDs.includes(map.id))
      )

      // Remove deleted maps
      const newIDs = Object.keys(newMaps)
      handlersCached.filter((map) => newIDs.includes(map.id))

      // const newListData = Object.keys(cachedMaps).map((mapID) => ({
      //   value: mapID,
      //   label: cachedMaps[mapID].name,
      //   image: routes.getThumbnail.url(mapID),
      //   description: cachedMaps[mapID].authorName,
      // }))
      // setListData([newListData, []])

      console.log('Successfully updated cached maps') // TODO: Remove
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const ItemComponent: TransferListItemComponent = ({
    data,
    selected,
  }: TransferListItemComponentProps) => (
    <Group noWrap>
      <Avatar src={data.image} radius='md' size='lg' />
      <div className='flex-1'>
        <Text size='md' weight={500}>
          {maps[data.value]?.name}
        </Text>
        <Text size='sm' color='dimmed' weight={400}>
          {maps[data.value]?.authorName}
        </Text>
      </div>
      <Checkbox
        checked={selected}
        onChange={() => {}}
        tabIndex={-1}
        sx={{ pointerEvents: 'none' }}
      />
    </Group>
  )

  // async function onClickMapInfo() {
  //   try {
  //     const fetchRes = await fetch(
  //       routes.getMapInfo.url('bqADnHDhKOfimntdyJnyu_ltVhj')
  //     )
  //     const response = (await fetchRes.json()) as GetMapInfoResponse
  //     setContent(response)
  //   } catch (error) {
  //     setContent({ error: String(error) })
  //   }
  // }

  // async function onClickCachedMaps() {
  //   try {
  //     const fetchRes = await fetch(routes.getCachedMaps.url())
  //     const response = (await fetchRes.json()) as GetCachedMapsResponse
  //     setContent(response)
  //   } catch (error) {
  //     setContent({ error: String(error) })
  //   }
  // }

  // async function onClickThumbnail() {
  //   try {
  //     const fetchRes = await fetch(
  //       routes.getThumbnail.url('bqADnHDhKOfimntdyJnyu_ltVhj')
  //     )
  //     const response = await fetchRes.text()
  //     setContent(response)
  //   } catch (error) {
  //     setContent({ error: String(error) })
  //   }
  // }

  // <div className='flex gap-10'>
  //   <Button variant='outline' onClick={onClickMapInfo}>
  //     Map Info
  //   </Button>
  //   <Button variant='outline' onClick={onClickCachedMaps}>
  //     Cached Maps
  //   </Button>
  //   <Button variant='outline' onClick={onClickThumbnail}>
  //     Thumbnail
  //   </Button>
  // </div>
  // <Prism language='javascript' className='w-full'>
  //   {JSON.stringify(content, null, 2)}
  // </Prism>

  const items = mapsCached.map((map, index) => (
    <Draggable key={map.id} index={index} draggableId={map.id}>
      {(provided, snapshot) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <Group noWrap p='xs'>
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
            {/* <Checkbox
            checked={selected}
            onChange={() => {}}
            tabIndex={-1}
            sx={{ pointerEvents: 'none' }}
          /> */}
          </Group>
        </div>
      )}
    </Draggable>
  ))

  return (
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <AppShell>
        <div className='flex h-full w-full flex-col items-center justify-center'>
          <DragDropContext
            onDragEnd={({ destination, source }) =>
              handlersCached.reorder({
                from: source.index,
                to: destination?.index || 0,
              })
            }
          >
            <Droppable droppableId='dnd-list' direction='vertical'>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {items}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          {/* <TransferList
            className='w-full'
            value={listData}
            onChange={setListData}
            searchPlaceholder='Search maps...'
            nothingFound='No maps found'
            titles={['Saved Maps', 'Active Maps']}
            listHeight={300}
            itemComponent={ItemComponent}
            listComponent={(props) => {
              console.log(props)
              const scrollProps = Object.fromEntries(
                Object.entries(props).filter(([key, val]) => key !== 'children')
              )
              return (
                <ScrollArea {...props} className='w-full'>
                  {props.children}
                </ScrollArea>
              )
            }}
            // TODO: Update this filter method
            filter={(query, item) =>
              item.label.toLowerCase().includes(query.toLowerCase().trim()) ||
              item.description
                .toLowerCase()
                .includes(query.toLowerCase().trim())
            }
          /> */}
          {/* <List>
            {Object.keys(maps).map((key) => (
              <List.Item
                key={key}
                icon={
                  <Image
                    src={routes.getThumbnail.url(key)}
                    alt=''
                    height={60}
                    radius={10}
                  />
                }
              >
                <div className='flex flex-col justify-center' style={{height: 60}}>
                  <Text fz='lg' fw='bold'>
                    {maps[key].name}
                  </Text>
                  <Text fz='md'>
                    {maps[key].authorName}
                  </Text>
                </div>
              </List.Item>
            ))}
          </List> */}
        </div>
      </AppShell>
    </MantineProvider>
  )
}
