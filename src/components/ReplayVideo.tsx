import { Video, staticFile } from "remotion";
import { ClipContext, useClipContext } from "./Clip";
import { useContext } from "react";

export const ReplayVideo: React.FC = () => {
  const clipData = useClipContext();
  return (
    <Video src={staticFile(clipData.videoData.videoFile)} className="z-0" />
  );
};
