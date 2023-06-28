import { routes } from '@global/api'
import { MapData } from '@global/types'
import { Avatar, Group, Text } from '@mantine/core'
import { Draggable } from 'react-beautiful-dnd'

export default function MapListItem({
  map,
  index,
}: {
  map: MapData
  index: number
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
            className={
              (snapshot.isDragging ? 'bg-neutral-700 rounded-lg ' : '') +
              'transition-all duration-300 hover:bg-neutral-700 hover:transition-none'
            }
            style={{ width: 400, height: 70 }}
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
