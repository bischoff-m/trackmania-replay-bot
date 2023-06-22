import { AbsoluteFill, Img, staticFile } from 'remotion'
import { colors, styles } from '@/theme'
import { IntroHeader } from '@/components/IntroHeader'
import { IntroLeaderboard } from '@/components/IntroLeaderboard'
import { IntroStatistics } from '@/components/IntroStatistics'

export const Intro: React.FC = () => {
  return (
    <>
      <AbsoluteFill
        className='absolute z-30 flex-col'
        style={{ backgroundColor: colors.darkPrimary }}
      >
        <div
          style={{
            flex: '0 0 450px',
            backgroundColor: colors.light,
            boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.25)',
          }}
        />
        <div className='flex-1' />
      </AbsoluteFill>
      <main
        className='z-40 flex h-full w-full'
        style={{ padding: 100, gap: 100, color: colors.light }}
      >
        <div style={{ flex: '0 0 750px' }}>
          <Img
            src={staticFile('img/Thumbnail.jpg')}
            className='w-full'
            style={{
              borderRadius: styles.borderRadius,
              boxShadow: '10px 10px 20px rgba(0, 0, 0, 0.25)',
              marginBottom: 80,
            }}
          />
          <IntroStatistics />
        </div>
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
