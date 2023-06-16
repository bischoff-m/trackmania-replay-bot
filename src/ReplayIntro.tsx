import { AbsoluteFill } from "remotion"
import { ReplayInfo } from "./globalTypes"
import { colors } from "./styles"

// TODO: https://www.npmjs.com/package/trackmania.io

export const ReplayIntro = (props: { replayInfo: ReplayInfo }) => {
  return (
    <>
      <AbsoluteFill className="absolute flex-col z-9" style={{ backgroundColor: colors.darkPrimary }}>
        <div style={{ flex: '0 0 400px', backgroundColor: colors.light, boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.25)' }} />
        <div className="flex-1" />
      </AbsoluteFill>
      <main className="flex w-full h-full z-10" style={{ padding: 100, gap: 100 }}>
        <div className="bg-red-600" style={{ flex: '0 0 750px' }}>
          <h1 className="text-5xl text-white">Test</h1>
        </div>
        <div className="flex-1 flex flex-col" style={{ gap: 100 }}>
          <div className="bg-blue-600" style={{ flex: '0 0 300px' }}>
            <h1 className="text-5xl text-white">Test</h1>
          </div>
          <div className="bg-green-600 flex-1">
            <h1 className="text-5xl text-white">Test</h1>
          </div>
        </div>
      </main>
    </>
  )
}