import { Clip } from '@/components/Clip'
import type { ReplayData } from '@global/types'
import { AbsoluteFill } from 'remotion'

export const MainComposition: React.FC<{
  data: ReplayData
}> = ({ data }) => {
  return (
    <>
      <AbsoluteFill>
        {Object.values(data).map((clipData, index) => (
          <Clip key={index} clipNumber={index + 1} clipData={clipData} />
        ))}
      </AbsoluteFill>
    </>
  )
}
