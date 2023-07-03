import {
  useClipContext,
  useCompositionContext,
} from '@/components/MainComposition'
import { routes } from '@global/api'
import { AbsoluteFill, Sequence, Video } from 'remotion'

export const ReplayVideo: React.FC = () => {
  const clipData = useClipContext()
  const compData = useCompositionContext()

  if (!clipData.video)
    return (
      <Sequence
        name={'Video ' + clipData.map.name}
        from={clipData.startFrame + compData.introDurationFrames}
        durationInFrames={compData.framerate} // 1 second
      >
        <AbsoluteFill className='flex items-center justify-center bg-gray-900 text-white'>
          <span className='text-8xl'>No replay video found</span>
          <span className='text-5xl pt-20 font-bold'>{clipData.map.name}</span>
          <span className='text-5xl pt-5'>by {clipData.map.authorName}</span>
        </AbsoluteFill>
      </Sequence>
    )

  return (
    <Sequence
      name={'Video ' + clipData.map.name}
      from={clipData.startFrame + compData.introDurationFrames}
      durationInFrames={clipData.video.durationInFrames}
    >
      <Video
        src={routes.getVideo.url(clipData.video.videoFile)}
        className='z-0'
      />
    </Sequence>
  )
}
