import { Clip } from '@/components/Clip'
import type { ClipData, CompositionData } from '@global/types'
import { createContext, useContext } from 'react'
import { AbsoluteFill } from 'remotion'

export const ClipContext = createContext<ClipData | null>(null)
export const CompositionContext = createContext<CompositionData | null>(null)

// Custom useContext hook to handle null check
// Use this to access the data fetched from trackmania.io
export const useClipContext = () => {
  const clipData = useContext(ClipContext)
  if (!clipData) throw new Error('Clip data not found')
  return clipData
}

// Custom useContext hook to handle null check
// Use this to access additional data not contained in the clip data
export const useCompositionContext = () => {
  const compData = useContext(CompositionContext)
  if (!compData) throw new Error('Composition data not found')
  return compData
}

export const MainComposition: React.FC<{
  data: CompositionData | null
}> = (props) => {
  if (props.data === null) return <AbsoluteFill>Nothing to render</AbsoluteFill>

  return (
    <AbsoluteFill>
      <CompositionContext.Provider value={props.data}>
        {Object.values(props.data.clips).map((clipData, index) => (
          <ClipContext.Provider key={index} value={clipData}>
            <Clip />
          </ClipContext.Provider>
        ))}
      </CompositionContext.Provider>
    </AbsoluteFill>
  )
}
