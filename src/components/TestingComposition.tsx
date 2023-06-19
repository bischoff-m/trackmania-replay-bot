import { AbsoluteFill } from "remotion";
import type { ReplayData } from "../global";
import { Clip } from "./Clip";

export const TestingComposition: React.FC<{
  data: ReplayData;
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
