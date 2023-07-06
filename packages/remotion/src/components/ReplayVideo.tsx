import { useClipContext } from '@/components/MainComposition'
import { formatStaticUrl } from '@global/api'
import { AbsoluteFill, Sequence, Video } from 'remotion'

export const ReplayVideo: React.FC = () => {
  const { composition, clip, map } = useClipContext()

  if (!clip.video)
    return (
      <Sequence
        name={'Video ' + map.name}
        from={clip.startFrame + composition.introDurationFrames}
        durationInFrames={composition.framerate} // 1 second
      >
        <AbsoluteFill className='flex items-center justify-center bg-gray-900 text-white'>
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
      durationInFrames={clip.video.durationInFrames}
    >
      <Video src={formatStaticUrl(clip.video.url)} className='z-0' />
    </Sequence>
  )
}
