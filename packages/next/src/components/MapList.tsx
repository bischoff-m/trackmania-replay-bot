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
    placeholderHover: theme.colors.dark[3],
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
            width: width,
            backgroundColor: fixedStyles.background,
          }}
        >
          {maps.length > 0 ? (
            <>
              {children}
              {provided.placeholder}
            </>
          ) : (
            // Placeholder
            <>
              <Center
                className={clsx('p-2', 'absolute')}
                style={{ width: width, height: itemHeight }}
              >
                <Center
                  p='xs'
                  sx={{
                    borderWidth: 1,
                    '&:hover': { borderColor: fixedStyles.placeholderHover },
                  }}
                  className={clsx(
                    'border-dashed',
                    'border-transparent',
                    'rounded-md',
                    'w-full',
                    'h-full',
                    'transition-all',
                    'duration-300'
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
