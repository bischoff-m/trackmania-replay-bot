import { Img, staticFile } from 'remotion'
import { colors, styles } from '@/theme'
import { useClipContext } from '@/components/MainComposition'
import { MapData } from '@global/types'
import { formatTrackmaniaTime } from '@global/util'

export const IntroHeader: React.FC = () => {
  const medals = [
    {
      icon: 'img/medal_author.png',
      value: '0:07.528',
    },
    {
      icon: 'img/medal_gold.png',
      value: '0:08:000',
    },
    {
      icon: 'img/medal_silver.png',
      value: '0:11.000',
    },
    {
      icon: 'img/medal_bronze.png',
      value: '0:14.000',
    },
  ]

  const mapData = useClipContext().map

  return (
    <main
      className='flex h-full w-full'
      style={{ gap: 40, color: colors.darkPrimary }}
    >
      {/* Left column */}
      <div className='flex h-full flex-1 flex-col justify-between py-5'>
        {/* Map title */}
        <span style={{ fontSize: 96, fontWeight: 700 }}>{mapData.name}</span>

        {/* Author flag and name */}
        <div className='flex w-full'>
          {mapData.authorNation !== 'UNKNOWN' && (
            <div className='flex items-center justify-center pr-8'>
              <Img
                src={`http://localhost:3000/getFlag/${mapData.authorNation}`}
                style={{ height: 60, borderRadius: styles.flagBorderRadius }}
              />
            </div>
          )}
          <span className='flex-1' style={{ fontSize: 64 }}>
            {mapData.authorName}
          </span>
        </div>
      </div>

      {/* Right column */}
      <div className='flex flex-col justify-between py-3'>
        {/* Medals */}
        {['author', 'gold', 'silver', 'bronze'].map((medal, index) => {
          const time = mapData.medals[medal as keyof MapData['medals']]
          return (
            <div
              key={index}
              className='flex items-center justify-end'
              style={{ gap: 20, height: 60 }}
            >
              <span style={{ fontSize: 48, fontFamily: 'Century Gothic' }}>
                {formatTrackmaniaTime(time)}
              </span>
              <Img
                src={staticFile(`img/medal_${medal}.png`)}
                style={{ height: 60 }}
              />
            </div>
          )
        })}
      </div>
    </main>
  )
}
