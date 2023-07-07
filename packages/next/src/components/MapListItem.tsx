import { formatStaticUrl } from '@global/api'
import { MapData } from '@global/types'
import { formatTrackmaniaTime } from '@global/util'
import {
  Avatar,
  Badge,
  Group,
  Text,
  clsx,
  useMantineTheme,
} from '@mantine/core'
import { Draggable } from 'react-beautiful-dnd'

export default function MapListItem({
  map,
  index,
  width,
  itemHeight,
  showIndex = false,
}: {
  map: MapData
  index: number
  width: number
  itemHeight: number
  showIndex?: boolean
}) {
  const theme = useMantineTheme()
  const fixedStyles = {
    background: theme.colors.dark[6],
    colorHover: theme.colors.dark[7],
  }

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
              'transition-all',
              'duration-300',
              'hover:transition-none',
              snapshot.isDragging ? 'rounded-lg' : ''
            )}
            sx={{
              width: width,
              height: itemHeight,
              '&:hover': { backgroundColor: fixedStyles.colorHover },
              backgroundColor: snapshot.isDragging
                ? fixedStyles.colorHover
                : fixedStyles.background,
            }}
          >
            {/* Index */}
            {showIndex && (
              <Text
                size='md'
                color='dimmed'
                weight={500}
                w='1.4rem'
                align='center'
              >
                #{index + 1}
              </Text>
            )}
            {/* Thumbnail */}
            <Avatar
              src={formatStaticUrl(map.thumbnailUrl)}
              radius='md'
              size='lg'
            />
            {/* Map and author name */}
            <div className='flex-1'>
              <Text size='md' weight={500}>
                {map.name}
              </Text>
              <Text size='sm' color='dimmed' weight={400}>
                {map.authorName}
              </Text>
            </div>
            {map.video && <Badge>Video</Badge>}
            {/* World record time */}
            <Text size='md' weight={400}>
              {formatTrackmaniaTime(map.leaderboard[0].time)}
            </Text>
          </Group>
        </div>
      )}
    </Draggable>
  )
}
