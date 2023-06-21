import React, { useEffect } from 'react'
import { Composition } from 'remotion'
import { MainComposition } from '@/remotion/components/MainComposition'
import { ReplayData, exampleReplays } from '@/globals'
import '@@/style.css'

// TODO: https://www.npmjs.com/package/trackmania.io
// TODO: Start here: https://tmio.greep.fr/#/docs/main/main/class/TMMap?scrollTo=subWR
// TODO: Define base path /public/remotion in global variable

// tmioLink: "https://trackmania.io/#/leaderboard/olsKnq_qAghcVAnEkoeUnVHFZei",
// tmioLink: "https://trackmania.io/#/leaderboard/PhJGvGjkCaw299rBhVsEhNJKX1",
// tmioLink: "https://trackmania.io/#/leaderboard/ho7WKyIBTV_dNmP9hFFadUvvtLd",

export const RemotionRoot: React.FC = () => {
  const [replays, setReplays] = React.useState<ReplayData | null>(null)

  useEffect(() => {
    // const allClips: CompositionData = {
    //   olsKnq_qAghcVAnEkoeUnVHFZei: {
    //     startFrame: 0,
    //     videoData: {
    //       videoFile: "/remotion/video-cache/Video1.webm",
    //       durationInFrames: 450,
    //     },
    //   },
    //   PhJGvGjkCaw299rBhVsEhNJKX1: {
    //     startFrame: 450,
    //     videoData: {
    //       videoFile: "/remotion/video-cache/Video2.webm",
    //       durationInFrames: 300,
    //     },
    //   },
    //   ho7WKyIBTV_dNmP9hFFadUvvtLd: {
    //     startFrame: 750,
    //     videoData: {
    //       videoFile: "/remotion/video-cache/Video3.webm",
    //       durationInFrames: 478,
    //     },
    //   },
    // };

    // TODO: maybe delayRender() is needed here?
    // fetch('/remotion/cache/ho7WKyIBTV_dNmP9hFFadUvvtLd.json').then((res) => {
    //   console.log(res)
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
