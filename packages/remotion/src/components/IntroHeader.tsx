import { useClipContext } from '@/components/MainComposition'
import { colors, styles } from '@/theme'
import { routes } from '@global/api'
import { MapData } from '@global/types'
import { formatTrackmaniaTime } from '@global/util'
import { Textfit } from 'react-textfit'
import { Img, staticFile } from 'remotion'

export const IntroHeader: React.FC = () => {
  const mapData = useClipContext().map

  return (
    <main
      className='flex h-full w-full'
      // Gap would normally be ~50px, but the <Textfit> component calculates the
      // font size too large
      style={{ gap: 100, color: colors.darkPrimary }}
    >
      {/* Left column */}
      <div className='flex h-full flex-1 flex-col justify-between py-5'>
        {/* Map title */}
        <div className='font-bold'>
          <Textfit
            mode='single'
            forceSingleModeWidth={false}
            max={96}
            // Height is expected to be set
            // https://github.com/malte-wessel/react-textfit/issues/35
            style={{ height: 150 }}
          >
            {mapData.name}
          </Textfit>
        </div>

        {/* Author flag and name */}
        <div className='flex w-full'>
          {mapData.authorNation !== 'UNKNOWN' && (
            <div className='flex items-center justify-center pr-8'>
              <Img
                src={routes.getFlag.url(mapData.authorNation)}
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
