import { useClipContext } from '@/components/MainComposition'
import { colors, styles } from '@/theme'
import { routes } from '@global/api'
import { Ranking } from '@global/types'
import { formatTrackmaniaDelta, formatTrackmaniaTime } from '@global/util'
import { Img } from 'remotion'

// TODO: End names with "..." if they are too long
// TODO: Scale down map names if they are too long
// TODO: Use classix

export const IntroLeaderboard: React.FC = () => {
  const { leaderboard } = useClipContext().map

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

  // const cellComponents = [
  const CellWrapper: React.FC<{
    emphasized: boolean
    children: React.ReactNode
    addStyles?: React.CSSProperties
  }> = ({ emphasized, children, addStyles }) => (
    <div
      className='flex items-center'
      style={{
        height: emphasized ? rowHeightBig : rowHeightSmall,
        ...addStyles,
      }}
    >
      {children}
    </div>
  )

  const cellChildren: ((
    ranking: Ranking,
    rowIndex: number,
    emphasized: boolean
  ) => any)[] = [
    // Number
    (ranking, index, emph) => index + 2,
    // Flag
    (ranking, index, emph) =>
      ranking.nation !== 'UNKNOWN' && (
        <Img
          key={index}
          src={routes.getFlag.url(ranking.nation)}
          style={{
            height: emph ? fontSizeBig : fontSizeSmall,
            borderRadius: styles.flagBorderRadius,
          }}
        />
      ),
    // Name
    (ranking, index, emph) => ranking.name,
    // Delta
    (ranking, index, emph) =>
      formatTrackmaniaDelta(ranking.time, leaderboard[0].time),
    // Time
    (ranking, index, emph) => formatTrackmaniaTime(ranking.time),
  ]

  const columnStyles: React.CSSProperties[] = [
    // Number
    {
      width: colWidthNumber,
    },
    // Flag
    {
      width: colWidthFlag,
    },
    // Name
    {
      flex: 1,
    },
    // Delta
    {},
    // Time
    {},
  ]

  const cellStyles: ((emphasized: boolean) => React.CSSProperties)[] = [
    // Number
    (emphasized) => ({
      justifyContent: 'center',
      fontSize: emphasized ? 1.2 * fontSizeBig : fontSizeSmall,
      fontFamily: 'Century Gothic',
      ...(emphasized && numberSecondaryStyle),
    }),
    // Flag
    (emphasized) => ({
      justifyContent: 'center',
    }),
    // Name
    (emphasized) => ({
      justifyContent: 'flex-start',
      fontSize: emphasized ? fontSizeBig : fontSizeSmall,
    }),
    // Delta
    (emphasized) => ({
      justifyContent: 'flex-end',
      fontSize: 0.95 * (emphasized ? 0.85 * fontSizeBig : fontSizeSmall),
      color: colors.textSecondary,
      fontFamily: 'Century Gothic',
    }),
    // Time
    (emphasized) => ({
      justifyContent: 'flex-end',
      fontSize: emphasized ? fontSizeBig : 1.2 * fontSizeSmall,
      fontFamily: 'Century Gothic',
      fontWeight: emphasized ? 700 : 400,
    }),
  ]

  function buildColumn(colIndex: number): React.ReactNode[] {
    const column = leaderboard.slice(1).map((ranking, rowIndex) => (
      <CellWrapper
        emphasized={rowIndex < 2}
        key={rowIndex}
        addStyles={cellStyles[colIndex](rowIndex < 2)}
      >
        {cellChildren[colIndex](ranking, rowIndex, rowIndex < 2)}
      </CellWrapper>
    ))
    if (leaderboard.length <= 3) return column
    else
      return [
        ...column.slice(0, 2),
        <div key={'gap'} style={{ height: verticalGap }} />,
        ...column.slice(2),
      ]
  }

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
          {leaderboard[0].nation !== 'UNKNOWN' && (
            <Img
              src={routes.getFlag.url(leaderboard[0].nation)}
              style={{ height: 60, borderRadius: styles.flagBorderRadius }}
            />
          )}
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
          {formatTrackmaniaTime(leaderboard[0].time)}
        </span>
      </div>

      {/* 2nd - 10th place */}
      {/* NOTE: 2nd, 3rd and the lower places need to be siblings to make the
          delta field line up.*/}
      <div className='flex flex-grow gap-6 pl-6 pr-12'>
        {
          // Iterate over the columns (Number, Flag, Name, Delta, Time)
          Array.from({ length: 5 }, (_, colIndex) => (
            <div
              key={colIndex}
              className={columnClasses}
              style={columnStyles[colIndex]}
            >
              {buildColumn(colIndex)}
            </div>
          ))
        }
      </div>
    </main>
  )
}
