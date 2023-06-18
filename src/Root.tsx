import React from "react";
import { Composition } from "remotion";
import { TestingComposition } from "./components/TestingComposition";
import "./style.css";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Testing"
        component={TestingComposition}
        durationInFrames={750 + 478}
        fps={60}
        width={2560}
        height={1440}
      />
    </>
  );
};