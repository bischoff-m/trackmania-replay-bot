import { AbsoluteFill, Sequence } from "remotion";
import { Intro } from "./Intro";
import { ReplayVideo } from "./ReplayVideo";
import { ClipData } from "../globalTypes";

export const Clip = (props: { clipNumber: number; clipData: ClipData }) => {
  let { startFrame, videoData } = props.clipData;
  return (
    <AbsoluteFill>
      <Sequence
        name={"Intro " + props.clipNumber}
        from={startFrame}
        durationInFrames={videoData.durationInFrames}
      >
        <Intro />
      </Sequence>
      <Sequence
        name={"Video " + props.clipNumber}
        from={startFrame}
        durationInFrames={videoData.durationInFrames}
      >
        <ReplayVideo videoFile={videoData.videoFile} />
      </Sequence>
    </AbsoluteFill>
  );
};
