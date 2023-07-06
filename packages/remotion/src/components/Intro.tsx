import { IntroHeader } from '@/components/IntroHeader'
import { IntroLeaderboard } from '@/components/IntroLeaderboard'
import { IntroStatistics } from '@/components/IntroStatistics'
import { useClipContext } from '@/components/MainComposition'
import { colors, styles } from '@/theme'
import { formatStaticUrl } from '@global/api'
import { AbsoluteFill, Img } from 'remotion'

export const Intro: React.FC = () => {
  const { map } = useClipContext()

  return (
    <>
      {/* Background */}
      <AbsoluteFill
        className='absolute z-30 flex-col'
        style={{ backgroundColor: colors.darkPrimary }}
      >
        <div
          style={{
            flex: '0 0 450px',
            backgroundColor: colors.light,
            boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.5)',
          }}
        />
        <div className='flex-1' />
      </AbsoluteFill>

      {/* Main Columns */}
      <main
        className='z-40 flex h-full w-full'
        style={{ padding: 100, gap: 100, color: colors.light }}
      >
        {/* Thumbnail and Statistics */}
        <div style={{ width: 750 }}>
          {/* TODO: If image has aspect ratio != 1, show the cropped regions in animation. */}
          <Img
            src={formatStaticUrl(map.thumbnailUrl)}
            className='w-full object-cover object-left'
            style={{
              borderRadius: styles.borderRadius,
              boxShadow: '10px 10px 20px rgba(0, 0, 0, 0.25)',
              marginBottom: 80,
              width: 750,
              height: 750,
            }}
          />
          <IntroStatistics />
        </div>

        {/* Header and Leaderboard */}
        <div className='flex flex-1 flex-col' style={{ gap: 100 }}>
          <div style={{ flex: '0 0 300px' }}>
            <IntroHeader />
          </div>
          <div className='flex-1'>
            <IntroLeaderboard />
          </div>
        </div>
      </main>
    </>
  )
}
