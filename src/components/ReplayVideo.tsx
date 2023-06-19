import { Video, staticFile } from "remotion";

export const ReplayVideo = (props: { videoFile: string }) => {
  return <Video src={staticFile(props.videoFile)} className="z-0" />;
};
