import { AbsoluteFill, Sequence } from "remotion";
import type { ReplayInfo } from "../globalTypes";
import { Intro } from "./Intro";

const videoInfo: ReplayInfo[] = [
  {
    src: "/remotion/video-cache/Video1.webm",
    durationInFrames: 450,
    startFrame: 0,
    tmioLink: "https://trackmania.io/#/leaderboard/olsKnq_qAghcVAnEkoeUnVHFZei",
  },
  // {
  //   src: "/video-cache/Video2.webm",
  //   durationInFrames: 300,
  //   startFrame: 450,
  //   tmioLink: "https://trackmania.io/#/leaderboard/PhJGvGjkCaw299rBhVsEhNJKX1",
  // },
  // {
  //   src: "/video-cache/Video3.webm",
  //   durationInFrames: 478,
  //   startFrame: 750,
  //   tmioLink: "https://trackmania.io/#/leaderboard/ho7WKyIBTV_dNmP9hFFadUvvtLd",
  // },
]

export const TestingComposition = () => {
  return (
    <>
      <AbsoluteFill>
        {
          videoInfo.map((video, index) => (
            <AbsoluteFill key={index}>
              <Sequence
                name={"Intro " + (index + 1)}
                from={video.startFrame}
                durationInFrames={video.durationInFrames}
              >
                <Intro replayInfo={video} />
              </Sequence>
              {/* <Sequence
                name={"Video " + (index + 1)}
                from={video.startFrame}
                durationInFrames={video.durationInFrames}
              >
                <Video src={staticFile(video.src)} />
              </Sequence> */}
            </AbsoluteFill>
          ))
        }
      </AbsoluteFill>
    </>
  );
};