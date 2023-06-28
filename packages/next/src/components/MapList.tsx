import { MapData } from '@global/types'
import { Center, Text, clsx, useMantineTheme } from '@mantine/core'
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
  const theme = useMantineTheme()
  const fixedStyles = {
    background: theme.colors.dark[6],
    placeholderBorder: theme.colors.dark[3],
  }

  return (
    <Droppable droppableId={droppableId} direction='vertical'>
      {(provided) => (
        <div
          className={clsx(grow ? 'flex-1' : '')}
          {...provided.droppableProps}
          ref={provided.innerRef}
          style={{
            minHeight: itemHeight,
            backgroundColor: fixedStyles.background,
            width: width,
          }}
        >
          <Center
            className={clsx('p-2', 'absolute')}
            style={{ width: width, height: itemHeight }}
          >
            <Center
              p='xs'
              sx={{
                borderWidth: 1,
                borderColor: fixedStyles.placeholderBorder,
                opacity: maps.length > 0 ? 0 : 1,
              }}
              className={clsx(
                'border-dashed',
                'rounded-md',
                'w-full',
                'h-full',
                'transition-all',
                'duration-500'
              )}
            >
              <Text size='sm' color='dimmed' weight={400}>
                Empty
              </Text>
            </Center>
          </Center>
          <div className='relative'>
            {children}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  )
}
