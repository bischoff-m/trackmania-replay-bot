import { Intro } from '@/components/Intro'
import {
  useClipContext,
  useCompositionContext,
} from '@/components/MainComposition'
import { ReplayVideo } from '@/components/ReplayVideo'
import { AbsoluteFill, Sequence } from 'remotion'

export const Clip: React.FC = () => {
  const clipData = useClipContext()
  const compData = useCompositionContext()

  return (
    <AbsoluteFill>
      <Sequence
        name={'Intro ' + clipData.map.name}
        from={clipData.startFrame}
        durationInFrames={compData.introDurationFrames}
      >
        <Intro />
      </Sequence>
      <ReplayVideo />
    </AbsoluteFill>
  )
}
