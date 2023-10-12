import { Intro } from '@/components/Intro'
import { useClipContext } from '@/components/MainComposition'
import { ReplayVideo } from '@/components/ReplayVideo'
import { AbsoluteFill, Sequence } from 'remotion'

export const Clip: React.FC = () => {
  const { composition, map } = useClipContext()
  const introDurationFrames =
    composition.introDurationSeconds * composition.framerate

  return (
    <AbsoluteFill>
      <Sequence
        name={'Intro ' + map.name}
        durationInFrames={introDurationFrames}
      >
        <Intro />
      </Sequence>
      <ReplayVideo from={introDurationFrames} />
    </AbsoluteFill>
  )
}
