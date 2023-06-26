import { AbsoluteFill, Sequence } from 'remotion'
import { Intro } from '@/components/Intro'
import { ReplayVideo } from '@/components/ReplayVideo'
import { useClipContext } from '@/components/MainComposition'

export const Clip: React.FC<{
  clipNumber: number
}> = ({ clipNumber }) => {
  const clipData = useClipContext()

  return (
    <AbsoluteFill>
      <Sequence
        name={'Intro ' + clipNumber}
        from={clipData.startFrame}
        durationInFrames={60 * 5} // TODO: Define frame rate and duration in global variables
      >
        <Intro />
      </Sequence>
      <Sequence
        name={'Video ' + clipNumber}
        from={clipData.startFrame + 60 * 5}
        durationInFrames={clipData.video.durationInFrames}
      >
        <ReplayVideo />
      </Sequence>
    </AbsoluteFill>
  )
}
