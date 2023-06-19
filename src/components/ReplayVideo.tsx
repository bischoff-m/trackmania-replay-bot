import { Video, staticFile } from "remotion";

export const ReplayVideo: React.FC<{
  videoFile: string;
}> = ({ videoFile }) => {
  return <Video src={staticFile(videoFile)} className="z-0" />;
};
