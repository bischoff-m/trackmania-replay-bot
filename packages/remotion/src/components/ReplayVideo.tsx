import { useClipContext } from '@/components/MainComposition'
import { colors } from '@/theme'
import { formatStaticUrl } from '@global/api'
import { AbsoluteFill, Sequence, Video } from 'remotion'

export const ReplayVideo: React.FC = () => {
  const { composition, clip, map } = useClipContext()

  if (!map.video)
    return (
      <Sequence
        name={'Video ' + map.name}
        from={clip.startFrame + composition.introDurationFrames}
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

  return (
    <Sequence
      name={'Video ' + map.name}
      from={clip.startFrame + composition.introDurationFrames}
      durationInFrames={map.video.durationInFrames}
    >
      <Video src={formatStaticUrl(map.video.url)} className='z-0' />
    </Sequence>
  )
}
