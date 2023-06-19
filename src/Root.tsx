import React, { useEffect } from "react";
import { Composition } from "remotion";
import { TestingComposition } from "./components/TestingComposition";
import { CompositionData } from "./globalTypes";
import "./style.css";

// tmioLink: "https://trackmania.io/#/leaderboard/olsKnq_qAghcVAnEkoeUnVHFZei",
// tmioLink: "https://trackmania.io/#/leaderboard/PhJGvGjkCaw299rBhVsEhNJKX1",
// tmioLink: "https://trackmania.io/#/leaderboard/ho7WKyIBTV_dNmP9hFFadUvvtLd",

export const RemotionRoot: React.FC = () => {
  const [data, setData] = React.useState<CompositionData | null>(null);

  useEffect(() => {
    const allClips: CompositionData = {
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
    setData(allClips);
  }, []);

  return (
    <>
      {data && (
        <Composition
          id="Testing"
          component={TestingComposition}
          durationInFrames={750 + 478}
          fps={60}
          width={2560}
          height={1440}
          defaultProps={{ data }}
        />
      )}
    </>
  );
};
