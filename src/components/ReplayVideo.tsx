import { Video, staticFile } from "remotion";
import type { ReplayInfo } from "../globalTypes";

export const ReplayVideo = (props: { replayInfo: ReplayInfo }) => {
  let info = props.replayInfo;
  return <Video src={staticFile(info.src)} className="z-0" />;
};
