import { AbsoluteFill, OffthreadVideo, Sequence, Video, staticFile, useCurrentFrame } from "remotion";
import { ReplayIntro } from "./ReplayIntro";
import type { ReplayInfo } from "./globalTypes";
import { ReplayVideo } from "./ReplayVideo";
import { use } from "react";

const videoInfo: ReplayInfo[] = [
  {
    src: "/video-cache/Video1.webm",
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
            <>
              <Sequence
                key={index}
                name={"Intro " + (index + 1)}
                from={video.startFrame}
                durationInFrames={video.durationInFrames}
              >
                <ReplayIntro replayInfo={video} />
              </Sequence>
              {/* <Sequence
                key={index}
                name={"Video " + (index + 1)}
                from={video.startFrame}
                durationInFrames={video.durationInFrames}
              >
                <Video src={staticFile(video.src)} />
              </Sequence> */}
            </>
          ))
        }
      </AbsoluteFill>
    </>
  );
};