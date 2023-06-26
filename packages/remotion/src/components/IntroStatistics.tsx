import { colors } from '@/theme'
import { loadFont } from '@remotion/google-fonts/IBMPlexMono'
import { useClipContext } from '@/components/MainComposition'
import moment from 'moment'

// TODO: Add trackmania.io map ID at bottom left(?)
// TODO: Add badges like "COTD" or "Royal Rotation"
// TODO: Add TMX Ratings (Awards, Map Value?)

const { fontFamily } = loadFont()

export const IntroStatistics: React.FC = () => {
  const mapData = useClipContext().map
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
        <span style={valueStyle}>
          {moment(mapData.uploadedAt).format('DD.MM.YYYY')}
        </span>
      </div>
      {/* <div>
        <span style={titleStyle}>{'> PLAYER COUNT'}</span>
        <br />
        <span style={valueStyle}>3,000,000 - 4,000,000</span>
      </div> */}
    </main>
  )
}
