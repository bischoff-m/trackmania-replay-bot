import { staticFile } from "remotion";
import { colors, styles } from "../theme";

export const IntroLeaderboard = () => {
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
  // Font sizes
  const fontSizeBig = 54;
  const fontSizeSmall = 40;

  // TODO: Add padding between 3rd and 4th place

  const RowNumber = (props: { emphasized: boolean; number: number }) => (
    <span
      className="flex items-center justify-center"
      style={{
        height: props.emphasized ? rowHeightBig : rowHeightSmall,
        fontSize: props.emphasized ? 1.2 * fontSizeBig : fontSizeSmall,
        fontFamily: "Century Gothic",
        ...(props.emphasized && numberSecondaryStyle),
      }}
    >
      {props.number}
    </span>
  );

  const RowFlag = (props: { emphasized: boolean; flag: string }) => (
    <div
      className="flex items-center justify-center"
      style={{ height: props.emphasized ? rowHeightBig : rowHeightSmall }}
    >
      <img
        src={staticFile(`remotion/${props.flag}.jpg`)}
        style={{
          height: props.emphasized ? fontSizeBig : fontSizeSmall,
          borderRadius: styles.flagBorderRadius,
        }}
      />
    </div>
  );

  const RowName = (props: { emphasized: boolean; name: string }) => (
    <span
      className="flex items-center"
      style={{
        height: props.emphasized ? rowHeightBig : rowHeightSmall,
        fontSize: props.emphasized ? fontSizeBig : fontSizeSmall,
      }}
    >
      {props.name}
    </span>
  );

  const RowDelta = (props: { emphasized: boolean; delta: string }) => (
    <span
      className="flex items-center justify-end"
      style={{
        height: props.emphasized ? rowHeightBig : rowHeightSmall,
        fontSize: 0.9 * (props.emphasized ? fontSizeBig : 0.9 * fontSizeSmall),
        color: colors.textSecondary,
        fontFamily: "Century Gothic",
      }}
    >
      {props.delta}
    </span>
  );

  const RowTime = (props: { emphasized: boolean; time: string }) => (
    <span
      className="flex items-center justify-end"
      style={{
        height: props.emphasized ? rowHeightBig : rowHeightSmall,
        fontSize: props.emphasized ? fontSizeBig : fontSizeSmall,
        fontFamily: "Century Gothic",
      }}
    >
      {props.time}
    </span>
  );

  return (
    <main className="flex h-full w-full flex-col" style={{ gap: 20 }}>
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
      <div className="flex flex-1 gap-6 pl-6 pr-12">
        {/* Numbers */}
        <div className={columnClasses} style={{ width: colWidthNumber }}>
          {records.slice(1).map((_, index) => (
            <RowNumber key={index} emphasized={index < 2} number={index + 2} />
          ))}
        </div>

        {/* Flags */}
        <div className={columnClasses} style={{ width: colWidthFlag }}>
          {records.slice(1).map((record, index) => (
            <RowFlag key={index} emphasized={index < 2} flag={record.flag} />
          ))}
        </div>

        {/* Names */}
        <div className={columnClasses + " flex-grow"}>
          {records.slice(1).map((record, index) => (
            <RowName key={index} emphasized={index < 2} name={record.name} />
          ))}
        </div>

        {/* Deltas */}
        <div className={columnClasses + " flex-shrink"}>
          {records.slice(1).map((record, index) => (
            <RowDelta key={index} emphasized={index < 2} delta={record.delta} />
          ))}
        </div>

        {/* Times */}
        <div className={columnClasses + " flex-shrink"}>
          {records.slice(1).map((record, index) => (
            <RowTime key={index} emphasized={index < 2} time={record.time} />
          ))}
        </div>
      </div>
    </main>
  );
};
