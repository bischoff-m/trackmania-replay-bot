import { Intro } from '@/components/Intro'
import { useClipContext } from '@/components/MainComposition'
import { ReplayVideo } from '@/components/ReplayVideo'
import { AbsoluteFill, Sequence } from 'remotion'

export const Clip: React.FC = () => {
  const { composition, clip, map } = useClipContext()

  return (
    <AbsoluteFill>
      <Sequence
        name={'Intro ' + map.name}
        from={clip.startFrame}
        durationInFrames={composition.introDurationFrames}
      >
        <Intro />
      </Sequence>
      <ReplayVideo />
    </AbsoluteFill>
  )
}
