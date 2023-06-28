import { routes } from '@global/api'
import { MapData } from '@global/types'
import { Avatar, Group, Text, clsx } from '@mantine/core'
import { Draggable } from 'react-beautiful-dnd'

export default function MapListItem({
  map,
  index,
  width,
  itemHeight,
}: {
  map: MapData
  index: number
  width: number
  itemHeight: number
}) {
  return (
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
            className={clsx(
              snapshot.isDragging ? 'bg-neutral-700 rounded-xl ' : '',
              'transition-all',
              'duration-300',
              'hover:bg-neutral-700',
              'hover:transition-none'
            )}
            style={{ width: width, height: itemHeight }}
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
  )
}
