import { api } from '@global/api'
import type { ClipData, CompositionData, MapData } from '@global/types'
import { Button } from '@mantine/core'

export default function SaveActiveMapsButton({
  isActive,
  setIsActive,
  mapsActive,
}: {
  isActive: boolean
  setIsActive: (isActive: boolean) => void
  mapsActive: MapData[]
}) {
  const onClickSave = async () => {
    // Build CompositionData
    const fps = 60
    const introDuration = 5 * fps
    let curFrame = 0
    const body: CompositionData = {
      // Reduce mapsActive to an object with the map IDs as keys
      clips: mapsActive.map((mapData) => {
        const replayDuration = mapData.video?.durationInFrames ?? fps
        const clipData: ClipData = {
          mapID: mapData.id,
          startFrame: curFrame,
          durationInFrames: introDuration + replayDuration,
        }
        curFrame += introDuration + replayDuration
        return clipData
      }),
      introDurationFrames: introDuration,
      framerate: fps,
      resolution: [2560, 1440],
    }

    // Send CompositionData to server
    api
      .setComposition(body)
      .then(() => {
        setIsActive(false)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  return (
    <Button
      variant='filled'
      style={{
        position: 'absolute',
        transform: isActive ? 'translateY(-30%)' : 'translateY(150%)',
        transition: 'transform 0.2s ease',
      }}
      onClick={onClickSave}
    >
      Save
    </Button>
  )
}
