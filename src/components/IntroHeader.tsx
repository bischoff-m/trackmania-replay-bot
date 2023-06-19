import { staticFile } from "remotion";
import { colors, styles } from "../theme";

export const IntroHeader: React.FC = () => {
  const medals = [
    {
      icon: "remotion/medal_author.png",
      value: "0:07.528",
    },
    {
      icon: "remotion/medal_gold.png",
      value: "0:08:000",
    },
    {
      icon: "remotion/medal_silver.png",
      value: "0:11.000",
    },
    {
      icon: "remotion/medal_bronze.png",
      value: "0:14.000",
    },
  ];

  return (
    <main
      className="flex h-full w-full"
      style={{ gap: 40, color: colors.darkPrimary }}
    >
      {/* Left column */}
      <div className="flex h-full flex-1 flex-col justify-between py-5">
        {/* Map title */}
        <span style={{ fontSize: 96, fontWeight: 700 }}>Training - 01</span>

        {/* Author flag and name */}
        <div className="flex w-full">
          <div className="flex items-center justify-center pr-8">
            <img
              src={staticFile("remotion/FRA.jpg")}
              style={{ height: 60, borderRadius: styles.flagBorderRadius }}
            />
          </div>
          <span className="flex-1" style={{ fontSize: 64 }}>
            Nadeo
          </span>
        </div>
      </div>

      {/* Right column */}
      <div className="flex flex-col justify-between py-3">
        {medals.map((medal, index) => (
          <div
            key={index}
            className="flex items-center justify-center"
            style={{ gap: 20, height: 60 }}
          >
            <span style={{ fontSize: 48, fontFamily: "Century Gothic" }}>
              {medal.value}
            </span>
            <img src={staticFile(medal.icon)} style={{ height: 60 }} />
          </div>
        ))}
      </div>
    </main>
  );
};
