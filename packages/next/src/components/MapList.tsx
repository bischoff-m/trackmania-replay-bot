import { MapData } from '@global/types'
import { Center, Text, clsx } from '@mantine/core'
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
          className={clsx('bg-neutral-800', 'rounded-md', grow ? 'flex-1' : '')}
          {...provided.droppableProps}
          ref={provided.innerRef}
          style={{ minHeight: itemHeight, width: width }}
        >
          {maps.length > 0 ? (
            [children, provided.placeholder]
          ) : (
            <>
              <Center
                className={clsx('p-2', 'absolute')}
                style={{ width: width, height: itemHeight }}
              >
                <Center
                  p='xs'
                  style={{ borderWidth: 1 }}
                  className={clsx(
                    'hover:border-dashed',
                    'hover:border-neutral-600',
                    'border-transparent',
                    'rounded-md',
                    'w-full',
                    'h-full'
                  )}
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
