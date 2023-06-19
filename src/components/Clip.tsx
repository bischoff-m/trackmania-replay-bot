import { AbsoluteFill, Sequence } from "remotion";
import { Intro } from "./Intro";
import { ReplayVideo } from "./ReplayVideo";
import { ClipData } from "../globalTypes";

export const Clip: React.FC<{
  clipNumber: number;
  clipData: ClipData;
}> = ({ clipNumber, clipData }) => {
  return (
    <AbsoluteFill>
      <Sequence
        name={"Intro " + clipNumber}
        from={clipData.startFrame}
        durationInFrames={clipData.videoData.durationInFrames}
      >
        <Intro />
      </Sequence>
      <Sequence
        name={"Video " + clipNumber}
        from={clipData.startFrame}
        durationInFrames={clipData.videoData.durationInFrames}
      >
        <ReplayVideo videoFile={clipData.videoData.videoFile} />
      </Sequence>
    </AbsoluteFill>
  );
};
