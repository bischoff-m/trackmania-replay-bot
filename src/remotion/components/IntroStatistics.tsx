import { colors } from '@@/theme'
import { loadFont } from '@remotion/google-fonts/IBMPlexMono'

// TODO: Add trackmania.io map ID at bottom left

const { fontFamily } = loadFont()

export const IntroStatistics: React.FC = () => {
  const titleStyle = {
    color: colors.textPrimary,
    fontSize: 36,
    fontFamily,
  }
  const valueStyle = {
    fontSize: 48,
    fontWeight: 700,
  }

  return (
    <main className='flex w-full flex-col' style={{ gap: 60 }}>
      <div>
        <span style={titleStyle}>{'> UPLOADED'}</span>
        <br />
        <span style={valueStyle}>11.07.2020</span>
      </div>
      <div>
        <span style={titleStyle}>{'> PLAYER COUNT'}</span>
        <br />
        <span style={valueStyle}>3,000,000 - 4,000,000</span>
      </div>
    </main>
  )
}
