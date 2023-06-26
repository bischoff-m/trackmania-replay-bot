import React, { useEffect } from 'react'
import { Composition } from 'remotion'
import { MainComposition } from '@/components/MainComposition'
import type { ReplayData } from '@global/types'
import { exampleReplays } from '@global/examples'
import '@/style.css'

// TODO: Define ports (3000, 4000, 5000) in global variable
// TODO: Define base path /public/remotion in global variable

// tmioLink: "https://trackmania.io/#/leaderboard/olsKnq_qAghcVAnEkoeUnVHFZei",
// tmioLink: "https://trackmania.io/#/leaderboard/PhJGvGjkCaw299rBhVsEhNJKX1",
// tmioLink: "https://trackmania.io/#/leaderboard/ho7WKyIBTV_dNmP9hFFadUvvtLd",

export const RemotionRoot: React.FC = () => {
  const [replays, setReplays] = React.useState<ReplayData | null>(null)

  useEffect(() => {
    // TODO: maybe delayRender() is needed here?
    // fetch('http://localhost:3000/getMapInfo/ho7WKyIBTV_dNmP9hFFadUvvtLd').then(async (res) => {
    //   console.log(res)
    //   const data2 = fetch('http://localhost:3000/getMapInfo/bqADnHDhKOfimntdyJnyu_ltVhj')
    //   // TODO: Process composition data here
    //   setReplays(exampleReplays)
    // })
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
