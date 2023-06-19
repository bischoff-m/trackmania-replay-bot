import { staticFile } from "remotion";
import { colors, styles } from "../theme";

export const IntroLeaderboard: React.FC = () => {
  const records = [
    {
      name: "ASdaS-BLR",
      time: "0:07.428",
      flag: "ITA",
      delta: "+0:00.000",
    },
    {
      name: "zzzzznot7_Harry",
      time: "0:07.428",
      flag: "ENG",
      delta: "+0:00.002",
    },
    {
      name: "Flechetas",
      time: "0:07.428",
      flag: "FRA",
      delta: "+0:00.002",
    },
    {
      name: "del2211261250015955839",
      time: "0:07.428",
      flag: "ITA",
      delta: "+0:00.002",
    },
    {
      name: "KarjeN",
      time: "0:07.428",
      flag: "SWE",
      delta: "+0:00.002",
    },
    {
      name: "poupipou.",
      time: "0:07.428",
      flag: "FRA",
      delta: "+0:00.002",
    },
    {
      name: "Perchignon",
      time: "0:07.428",
      flag: "FRA",
      delta: "+0:00.002",
    },
    {
      name: "KaarloKek",
      time: "0:07.428",
      flag: "FIN",
      delta: "+0:00.002",
    },
    {
      name: "ZedroXTM",
      time: "0:07.428",
      flag: "FRA",
      delta: "+0:00.002",
    },
    {
      name: "Stormyymate",
      time: "0:07.428",
      flag: "AUS",
      delta: "+0:00.002",
    },
  ];

  const numberPrimaryStyle = {
    fontSize: 96,
    color: colors.light,
    WebkitTextStrokeColor: colors.darkPrimary,
    WebkitTextStrokeWidth: 3,
    fontWeight: 700,
    fontFamily: "Century Gothic",
  };
  const numberSecondaryStyle = {
    color: colors.darkPrimary,
    WebkitTextStrokeColor: colors.light,
    WebkitTextStrokeWidth: 2,
    fontWeight: 700,
  };

  const columnClasses = "flex h-full flex-col justify-start";
  // Row heights and column widths
  const rowHeightBig = 120;
  const rowHeightSmall = 60;
  const colWidthNumber = 100;
  const colWidthFlag = 80;
  // Gap between 1st <-> 2nd and 3rd <-> 4th
  const verticalGap = 20;
  // Font sizes
  const fontSizeBig = 54;
  const fontSizeSmall = 40;

  // TODO: Add padding between 3rd and 4th place
  // TODO: Use https://www.npmjs.com/package/twrnc

  const RowNumber: React.FC<{
    emphasized: boolean;
    number: number;
  }> = ({ emphasized, number }) => (
    <span
      className="flex items-center justify-center"
      style={{
        height: emphasized ? rowHeightBig : rowHeightSmall,
        fontSize: emphasized ? 1.2 * fontSizeBig : fontSizeSmall,
        fontFamily: "Century Gothic",
        ...(emphasized && numberSecondaryStyle),
      }}
    >
      {number}
    </span>
  );

  const RowFlag: React.FC<{
    emphasized: boolean;
    flag: string;
  }> = ({ emphasized, flag }) => (
    <div
      className="flex items-center justify-center"
      style={{ height: emphasized ? rowHeightBig : rowHeightSmall }}
    >
      <img
        src={staticFile(`remotion/${flag}.jpg`)}
        style={{
          height: emphasized ? fontSizeBig : fontSizeSmall,
          borderRadius: styles.flagBorderRadius,
        }}
      />
    </div>
  );

  const RowName: React.FC<{
    emphasized: boolean;
    name: string;
  }> = ({ emphasized, name }) => (
    <span
      className="flex items-center"
      style={{
        height: emphasized ? rowHeightBig : rowHeightSmall,
        fontSize: emphasized ? fontSizeBig : fontSizeSmall,
      }}
    >
      {name}
    </span>
  );

  const RowDelta: React.FC<{
    emphasized: boolean;
    delta: string;
  }> = ({ emphasized, delta }) => (
    <span
      className="flex items-center justify-end"
      style={{
        height: emphasized ? rowHeightBig : rowHeightSmall,
        fontSize: 0.8 * (emphasized ? 0.9 * fontSizeBig : fontSizeSmall),
        color: colors.textSecondary,
        fontFamily: "Century Gothic",
      }}
    >
      {delta}
    </span>
  );

  const RowTime: React.FC<{
    emphasized: boolean;
    time: string;
  }> = ({ emphasized, time }) => (
    <span
      className="flex items-center justify-end"
      style={{
        height: emphasized ? rowHeightBig : rowHeightSmall,
        fontSize: emphasized ? fontSizeBig : 1.2 * fontSizeSmall,
        fontFamily: "Century Gothic",
        fontWeight: emphasized ? 700 : 400,
      }}
    >
      {time}
    </span>
  );

  return (
    <main className="flex h-full w-full flex-col" style={{ gap: verticalGap }}>
      {/* World Record */}
      <div
        className="flex items-center gap-6 pl-6 pr-12"
        style={{
          height: 150,
          backgroundColor: colors.light,
          color: colors.darkPrimary,
          borderRadius: styles.borderRadius,
        }}
      >
        {/* Number */}
        <span
          className="flex justify-center"
          style={{ width: colWidthNumber, ...numberPrimaryStyle }}
        >
          1
        </span>

        {/* Flag */}
        <div
          className="flex w-20 justify-center"
          style={{ width: colWidthFlag }}
        >
          <img
            src={staticFile(`remotion/${records[0].flag}.jpg`)}
            style={{ height: 48, borderRadius: styles.flagBorderRadius }}
          />
        </div>

        {/* Name */}
        <span
          className="flex flex-grow items-center"
          style={{ fontSize: 64, fontWeight: 700 }}
        >
          {records[0].name}
        </span>

        {/* Time */}
        <span
          className="flex items-center"
          style={{
            fontSize: 64,
            fontWeight: 700,
            fontFamily: "Century Gothic",
          }}
        >
          {records[0].time}
        </span>
      </div>

      {/* 2nd - 10th place */}
      {/* NOTE: 2nd, 3rd and the lower places need to be siblings to make the
          delta field line up.*/}
      <div className="flex flex-1 gap-6 pl-6 pr-12">
        {/* Numbers */}
        <div className={columnClasses} style={{ width: colWidthNumber }}>
          {records.slice(1, 3).map((_, index) => (
            <RowNumber key={index} emphasized={true} number={index + 2} />
          ))}
          <div style={{ height: verticalGap }} />
          {records.slice(3).map((_, index) => (
            <RowNumber key={index} emphasized={false} number={index + 4} />
          ))}
        </div>

        {/* Flags */}
        <div className={columnClasses} style={{ width: colWidthFlag }}>
          {records.slice(1, 3).map((record, index) => (
            <RowFlag key={index} emphasized={true} flag={record.flag} />
          ))}
          <div style={{ height: verticalGap }} />
          {records.slice(3).map((record, index) => (
            <RowFlag key={index} emphasized={false} flag={record.flag} />
          ))}
        </div>

        {/* Names */}
        <div className={columnClasses + " flex-grow"}>
          {records.slice(1, 3).map((record, index) => (
            <RowName key={index} emphasized={true} name={record.name} />
          ))}
          <div style={{ height: verticalGap }} />
          {records.slice(3).map((record, index) => (
            <RowName key={index} emphasized={false} name={record.name} />
          ))}
        </div>

        {/* Deltas */}
        <div className={columnClasses + " flex-shrink"}>
          {records.slice(1, 3).map((record, index) => (
            <RowDelta key={index} emphasized={true} delta={record.delta} />
          ))}
          <div style={{ height: verticalGap }} />
          {records.slice(3).map((record, index) => (
            <RowDelta key={index} emphasized={false} delta={record.delta} />
          ))}
        </div>

        {/* Times */}
        <div className={columnClasses + " flex-shrink"}>
          {records.slice(1, 3).map((record, index) => (
            <RowTime key={index} emphasized={true} time={record.time} />
          ))}
          <div style={{ height: verticalGap }} />
          {records.slice(3).map((record, index) => (
            <RowTime key={index} emphasized={false} time={record.time} />
          ))}
        </div>
      </div>
    </main>
  );
};
