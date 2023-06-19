import { AbsoluteFill } from "remotion";
import type { CompositionData } from "../globalTypes";
import { Clip } from "./Clip";

export const TestingComposition: React.FC<{
  data: CompositionData;
}> = ({ data }) => {
  return (
    <>
      <AbsoluteFill>
        {Object.values(data).map((clipData, index) => (
          <Clip key={index} clipNumber={index + 1} clipData={clipData} />
        ))}
      </AbsoluteFill>
    </>
  );
};
