import { formatStaticUrl } from '@global/api'
import { MapData } from '@global/types'
import { formatTrackmaniaTime } from '@global/util'
import { Avatar, Badge, Group, Text, clsx } from '@mantine/core'
import { DraggableStateSnapshot } from 'react-beautiful-dnd'

export default function MapListItem({
  map,
  index,
  height,
  draggableSnapshot,
  hoverColor,
  bgColor,
}: {
  map: MapData
  index?: number
  height: number
  draggableSnapshot?: DraggableStateSnapshot
  hoverColor?: string
  bgColor?: string
}) {
  return (
    <Group
      noWrap
      p='xs'
      className={clsx(
        'transition-all',
        'duration-300',
        'hover:transition-none',
        draggableSnapshot?.isDragging ? 'rounded-lg' : ''
      )}
      sx={{
        height: height,
        '&:hover': { backgroundColor: hoverColor || undefined },
        backgroundColor: draggableSnapshot?.isDragging
          ? hoverColor || undefined
          : bgColor || undefined,
      }}
    >
      {/* Index */}
      {index !== undefined && (
        <Text size='md' color='dimmed' weight={500} w='1.4rem' align='center'>
          #{index + 1}
        </Text>
      )}
      {/* Thumbnail */}
      <Avatar src={formatStaticUrl(map.thumbnailUrl)} radius='md' size='lg' />
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
      {!map.replayUrl && <Badge color='red'>No Replay</Badge>}
      {!map.ghostUrl && <Badge color='red'>No Ghost</Badge>}
      {/* World record time */}
      <Text size='md' weight={400}>
        {formatTrackmaniaTime(map.leaderboard[0].time)}
      </Text>
    </Group>
  )
}
