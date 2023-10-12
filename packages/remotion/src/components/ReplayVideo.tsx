import { useClipContext } from '@/components/MainComposition'
import { colors } from '@/theme'
import { formatStaticUrl } from '@global/api'
import { AbsoluteFill, Sequence, Video } from 'remotion'

export const ReplayVideo: React.FC<{ from: number }> = (props) => {
  const { composition, map } = useClipContext()

  if (
    !map.video ||
    map.video.durationInFrames === 0 ||
    composition.framerate === 0
  )
    return (
      <Sequence
        name={'Video ' + map.name}
        from={props.from}
        durationInFrames={composition.framerate} // 1 second
      >
        <AbsoluteFill
          className='flex items-center justify-center text-white'
          style={{ backgroundColor: colors.darkPrimary }}
        >
          <span className='text-8xl'>No replay video found</span>
          <span className='text-5xl pt-20 font-bold'>{map.name}</span>
          <span className='text-5xl pt-5'>by {map.authorName}</span>
        </AbsoluteFill>
      </Sequence>
    )
  else
    return (
      <Sequence
        name={'Video ' + map.name}
        from={props.from}
        durationInFrames={Math.ceil(
          (map.video.durationInFrames * composition.framerate) /
            map.video.framerate
        )}
      >
        <Video src={formatStaticUrl(map.video.url)} className='z-0' />
      </Sequence>
    )
}
