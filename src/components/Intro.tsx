import { AbsoluteFill, staticFile } from "remotion"
import { ReplayInfo } from "../globalTypes"
import { colors, styles } from "../theme"
import { IntroStatistics } from "./IntroStatistics"
import { IntroHeader } from "./IntroHeader"
import { IntroLeaderboard } from "./IntroLeaderboard"

// TODO: https://www.npmjs.com/package/trackmania.io

export const Intro = (props: { replayInfo: ReplayInfo }) => {
  return (
    <>
      <AbsoluteFill className="absolute flex-col z-30" style={{ backgroundColor: colors.darkPrimary }}>
        <div style={{ flex: '0 0 450px', backgroundColor: colors.light, boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.25)' }} />
        <div className="flex-1" />
      </AbsoluteFill>
      <main className="flex w-full h-full z-40" style={{ padding: 100, gap: 100, color: colors.light }}>
        <div style={{ flex: '0 0 750px' }}>
          <img
            src={staticFile("remotion/Thumbnail.jpg")}
            className="w-full"
            style={{
              borderRadius: styles.borderRadius,
              boxShadow: '10px 10px 20px rgba(0, 0, 0, 0.25)',
              marginBottom: 80,
            }}
          />
          <IntroStatistics replayInfo={props.replayInfo} />
        </div>
        <div className="flex-1 flex flex-col" style={{ gap: 100 }}>
          <div style={{ flex: '0 0 300px' }}>
            <IntroHeader />
          </div>
          <div className="flex-1">
            <IntroLeaderboard />
          </div>
        </div>
      </main>
    </>
  )
}