import { MainComposition } from '@/components/MainComposition'
import '@/style.css'
import { exampleReplays } from '@global/examples'
import type { ReplayData } from '@global/types'
import React, { useEffect } from 'react'
import { Composition } from 'remotion'

// TODO: Define base path /public/remotion in global variable

// tmioLink: "https://trackmania.io/#/leaderboard/olsKnq_qAghcVAnEkoeUnVHFZei",
// tmioLink: "https://trackmania.io/#/leaderboard/PhJGvGjkCaw299rBhVsEhNJKX1",
// tmioLink: "https://trackmania.io/#/leaderboard/ho7WKyIBTV_dNmP9hFFadUvvtLd",

export const RemotionRoot: React.FC = () => {
  const [replays, setReplays] = React.useState<ReplayData | null>(null)

  useEffect(() => {
    // TODO: maybe delayRender() is needed here?
    setReplays(exampleReplays)
  }, [])

  return (
    <>
      {replays && (
        <Composition
          id='MainComposition'
          component={MainComposition}
          durationInFrames={Object.values(replays).reduce(
            (sum, clip) => sum + clip.durationInFrames,
            0
          )}
          fps={60}
          width={2560}
          height={1440}
          defaultProps={{ data: replays }}
        />
      )}
    </>
  )
}
