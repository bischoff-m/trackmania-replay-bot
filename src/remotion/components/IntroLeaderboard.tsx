import { colors, styles } from '@@/theme'
import { staticFile } from 'remotion'
import { useClipContext } from '@@/components/Clip'

// TODO: End names with "..." if they are too long
// TODO: Scale down map names if they are too long
// TODO: Use https://www.npmjs.com/package/twrnc

export const IntroLeaderboard: React.FC = () => {
  const clipData = useClipContext()
  const { leaderboard } = clipData.introData
  let deltas = leaderboard.map((record) => record.time - leaderboard[0].time)

  const numberPrimaryStyle = {
    fontSize: 96,
    color: colors.light,
    WebkitTextStrokeColor: colors.darkPrimary,
    WebkitTextStrokeWidth: 3,
    fontWeight: 700,
    fontFamily: 'Century Gothic',
  }
  const numberSecondaryStyle = {
    color: colors.darkPrimary,
    WebkitTextStrokeColor: colors.light,
    WebkitTextStrokeWidth: 2,
    fontWeight: 700,
  }

  const columnClasses = 'flex h-full flex-col justify-start'
  // Row heights and column widths
  const rowHeightBig = 120
  const rowHeightSmall = 60
  const colWidthNumber = 100
  const colWidthFlag = 80
  // Gap between 1st <-> 2nd and 3rd <-> 4th
  const verticalGap = 20
  // Font sizes
  const fontSizeBig = 54
  const fontSizeSmall = 40

  const RowNumber: React.FC<{
    emphasized: boolean
    number: number
  }> = ({ emphasized, number }) => (
    <span
      className='flex items-center justify-center'
      style={{
        height: emphasized ? rowHeightBig : rowHeightSmall,
        fontSize: emphasized ? 1.2 * fontSizeBig : fontSizeSmall,
        fontFamily: 'Century Gothic',
        ...(emphasized && numberSecondaryStyle),
      }}
    >
      {number}
    </span>
  )

  const RowFlag: React.FC<{
    emphasized: boolean
    nation: string
  }> = ({ emphasized, nation }) => (
    <div
      className='flex items-center justify-center'
      style={{ height: emphasized ? rowHeightBig : rowHeightSmall }}
    >
      <img
        src={staticFile(`remotion/img/${nation}.jpg`)}
        style={{
          height: emphasized ? fontSizeBig : fontSizeSmall,
          borderRadius: styles.flagBorderRadius,
        }}
      />
    </div>
  )

  const RowName: React.FC<{
    emphasized: boolean
    name: string
  }> = ({ emphasized, name }) => (
    <span
      className='flex items-center'
      style={{
        height: emphasized ? rowHeightBig : rowHeightSmall,
        fontSize: emphasized ? fontSizeBig : fontSizeSmall,
      }}
    >
      {name}
    </span>
  )

  const RowDelta: React.FC<{
    emphasized: boolean
    delta: number
  }> = ({ emphasized, delta }) => (
    <span
      className='flex items-center justify-end'
      style={{
        height: emphasized ? rowHeightBig : rowHeightSmall,
        fontSize: 0.95 * (emphasized ? 0.85 * fontSizeBig : fontSizeSmall),
        color: colors.textSecondary,
        fontFamily: 'Century Gothic',
      }}
    >
      {/* TODO: Convert millis to string */}
      {'+0:00.003'}
    </span>
  )

  const RowTime: React.FC<{
    emphasized: boolean
    time: number
  }> = ({ emphasized, time }) => (
    <span
      className='flex items-center justify-end'
      style={{
        height: emphasized ? rowHeightBig : rowHeightSmall,
        fontSize: emphasized ? fontSizeBig : 1.2 * fontSizeSmall,
        fontFamily: 'Century Gothic',
        fontWeight: emphasized ? 700 : 400,
      }}
    >
      {/* TODO: Convert millis to string */}
      {'0:07.000'}
    </span>
  )

  return (
    <main className='flex h-full w-full flex-col' style={{ gap: verticalGap }}>
      {/* World Record */}
      <div
        className='flex items-center gap-6 pl-6 pr-12'
        style={{
          height: 150,
          backgroundColor: colors.light,
          color: colors.darkPrimary,
          borderRadius: styles.borderRadius,
          boxShadow: '10px 10px 20px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Number */}
        <span
          className='flex justify-center'
          style={{ width: colWidthNumber, ...numberPrimaryStyle }}
        >
          1
        </span>

        {/* Flag */}
        <div
          className='flex w-20 justify-center'
          style={{ width: colWidthFlag }}
        >
          <img
            src={staticFile(`remotion/img/${leaderboard[0].nation}.jpg`)}
            style={{ height: 48, borderRadius: styles.flagBorderRadius }}
          />
        </div>

        {/* Name */}
        <span
          className='flex flex-grow items-center'
          style={{ fontSize: 64, fontWeight: 700 }}
        >
          {leaderboard[0].name}
        </span>

        {/* Time */}
        <span
          className='flex items-center'
          style={{
            fontSize: 64,
            fontWeight: 700,
            fontFamily: 'Century Gothic',
          }}
        >
          {/* TODO: Format as 0.00:00.000 */}
          {leaderboard[0].time}
        </span>
      </div>

      {/* 2nd - 10th place */}
      {/* NOTE: 2nd, 3rd and the lower places need to be siblings to make the
          delta field line up.*/}
      <div className='flex flex-1 gap-6 pl-6 pr-12'>
        {/* Numbers */}
        <div className={columnClasses} style={{ width: colWidthNumber }}>
          {leaderboard.slice(1, 3).map((_, index) => (
            <RowNumber key={index} emphasized={true} number={index + 2} />
          ))}
          <div style={{ height: verticalGap }} />
          {leaderboard.slice(3).map((_, index) => (
            <RowNumber key={index} emphasized={false} number={index + 4} />
          ))}
        </div>

        {/* Flags */}
        <div className={columnClasses} style={{ width: colWidthFlag }}>
          {leaderboard.slice(1, 3).map((record, index) => (
            <RowFlag key={index} emphasized={true} nation={record.nation} />
          ))}
          <div style={{ height: verticalGap }} />
          {leaderboard.slice(3).map((record, index) => (
            <RowFlag key={index} emphasized={false} nation={record.nation} />
          ))}
        </div>

        {/* Names */}
        <div className={columnClasses + ' flex-grow'}>
          {leaderboard.slice(1, 3).map((record, index) => (
            <RowName key={index} emphasized={true} name={record.name} />
          ))}
          <div style={{ height: verticalGap }} />
          {leaderboard.slice(3).map((record, index) => (
            <RowName key={index} emphasized={false} name={record.name} />
          ))}
        </div>

        {/* Deltas */}
        <div className={columnClasses + ' flex-shrink'}>
          {leaderboard.slice(1, 3).map((record, index) => (
            <RowDelta key={index} emphasized={true} delta={deltas[index + 1]} />
          ))}
          <div style={{ height: verticalGap }} />
          {leaderboard.slice(3).map((record, index) => (
            <RowDelta
              key={index}
              emphasized={false}
              delta={deltas[index + 3]}
            />
          ))}
        </div>

        {/* Times */}
        <div className={columnClasses + ' flex-shrink'}>
          {leaderboard.slice(1, 3).map((record, index) => (
            <RowTime key={index} emphasized={true} time={record.time} />
          ))}
          <div style={{ height: verticalGap }} />
          {leaderboard.slice(3).map((record, index) => (
            <RowTime key={index} emphasized={false} time={record.time} />
          ))}
        </div>
      </div>
    </main>
  )
}
