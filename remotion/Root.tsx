import React from "react";
import { Composition } from "remotion";
import { MyComposition as TestingComposition } from "./TestingComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Testing"
        component={TestingComposition}
        durationInFrames={120}
        fps={60}
        width={2560}
        height={1440}
      />
    </>
  );
};