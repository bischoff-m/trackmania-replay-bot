import { AbsoluteFill, Sequence } from 'remotion'
import { Intro } from '@@/components/Intro'
import { ReplayVideo } from '@@/components/ReplayVideo'
import { ClipData } from '@/globals'
import { createContext, useContext } from 'react'

export const ClipContext = createContext<ClipData | null>(null)

// Custom useContext hook to handle null check
// Use this to access the data fetched from trackmania.io
export const useClipContext = () => {
  const clipData = useContext(ClipContext)
  if (!clipData) throw new Error('Clip data not found')
  return clipData
}

export const Clip: React.FC<{
  clipNumber: number
  clipData: ClipData
}> = ({ clipNumber, clipData }) => {
  return (
    <ClipContext.Provider value={clipData}>
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
          durationInFrames={clipData.videoData.durationInFrames}
        >
          <ReplayVideo />
        </Sequence>
      </AbsoluteFill>
    </ClipContext.Provider>
  )
}
