import { MapData } from '@global/types'
import { Center, Text } from '@mantine/core'
import { Droppable } from 'react-beautiful-dnd'

export default function MapList({
  children,
  maps,
  droppableId,
  width,
  itemHeight,
  grow = false,
}: {
  children?: React.ReactNode
  maps: MapData[]
  droppableId: string
  width: number
  itemHeight: number
  grow?: boolean
}) {
  return (
    <Droppable droppableId={droppableId} direction='vertical'>
      {(provided) => (
        <div
          className={`bg-neutral-800 rounded-md ${grow ? 'flex-1' : ''}`}
          {...provided.droppableProps}
          ref={provided.innerRef}
          style={{ minHeight: itemHeight, width: width }}
        >
          {maps.length > 0 ? (
            [children, provided.placeholder]
          ) : (
            <>
              <Center
                className='p-2 absolute'
                style={{ width: width, height: itemHeight }}
              >
                <Center
                  p='xs'
                  className='hover:border-dashed hover:border-neutral-600 border-transparent rounded-md w-full h-full'
                  style={{ borderWidth: 1 }}
                >
                  <Text size='sm' color='dimmed' weight={400}>
                    Place maps here
                  </Text>
                </Center>
              </Center>
              {provided.placeholder}
            </>
          )}
        </div>
      )}
    </Droppable>
  )
}
