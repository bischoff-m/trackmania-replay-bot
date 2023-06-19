import { createContext } from "react";
import { AbsoluteFill } from "remotion";
import type { ClipData as ClipData } from "../globalTypes";
import { Clip } from "./Clip";

// tmioLink: "https://trackmania.io/#/leaderboard/olsKnq_qAghcVAnEkoeUnVHFZei",
// tmioLink: "https://trackmania.io/#/leaderboard/PhJGvGjkCaw299rBhVsEhNJKX1",
// tmioLink: "https://trackmania.io/#/leaderboard/ho7WKyIBTV_dNmP9hFFadUvvtLd",

const allClips: { [clipID: string]: ClipData } = {
  olsKnq_qAghcVAnEkoeUnVHFZei: {
    startFrame: 0,
    videoData: {
      videoFile: "/remotion/video-cache/Video1.webm",
      durationInFrames: 450,
    },
  },
  PhJGvGjkCaw299rBhVsEhNJKX1: {
    startFrame: 450,
    videoData: {
      videoFile: "/remotion/video-cache/Video2.webm",
      durationInFrames: 300,
    },
  },
  ho7WKyIBTV_dNmP9hFFadUvvtLd: {
    startFrame: 750,
    videoData: {
      videoFile: "/remotion/video-cache/Video3.webm",
      durationInFrames: 478,
    },
  },
};

export const TestingComposition = () => {
  return (
    <>
      <AbsoluteFill>
        {Object.values(allClips).map((clipData, index) => (
          <Clip key={index} clipNumber={index + 1} clipData={clipData} />
        ))}
      </AbsoluteFill>
    </>
  );
};
