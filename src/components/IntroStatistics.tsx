import { ReplayInfo } from "../globalTypes";
import { colors } from "../theme";

export const IntroStatistics = (props: { replayInfo: ReplayInfo }) => {
  const titleStyle = {
    color: colors.textPrimary,
    fontFamily: "IBM Plex Mono",
    fontSize: 36,
  };
  const valueStyle = {
    fontSize: 48,
    fontWeight: 700,
  };

  return (
    <main className="flex w-full flex-col" style={{ gap: 60 }}>
      <div>
        <span style={titleStyle}>{"> UPLOADED"}</span>
        <br />
        <span style={valueStyle}>11.07.2020</span>
      </div>
      <div>
        <span style={titleStyle}>{"> PLAYER COUNT"}</span>
        <br />
        <span style={valueStyle}>3,000,000 - 4,000,000</span>
      </div>
    </main>
  );
};
