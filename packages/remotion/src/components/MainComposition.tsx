import { Clip } from '@/components/Clip'
import type { ClipData, ReplayData } from '@global/types'
import { createContext, useContext } from 'react'
import { AbsoluteFill } from 'remotion'

export const ClipContext = createContext<ClipData | null>(null)

// Custom useContext hook to handle null check
// Use this to access the data fetched from trackmania.io
export const useClipContext = () => {
  const clipData = useContext(ClipContext)
  if (!clipData) throw new Error('Clip data not found')
  return clipData
}

export const MainComposition: React.FC<{
  data: ReplayData
}> = ({ data }) => {
  return (
    <>
      <AbsoluteFill>
        {Object.values(data).map((clipData, index) => (
          <ClipContext.Provider key={index} value={clipData}>
            <Clip clipNumber={index + 1} />
          </ClipContext.Provider>
        ))}
      </AbsoluteFill>
    </>
  )
}
