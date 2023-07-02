import { routes } from '@global/api'
import type { CompositionData, MapData } from '@global/types'
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
    const fps = 60
    const introDuration = 5 * fps
    const replayDuration = 450
    let curFrame = 0
    const body: CompositionData = {
      // Reduce mapsActive to an object with the map IDs as keys
      clips: mapsActive.reduce((acc, map) => {
        acc[map.id] = {
          startFrame: curFrame,
          durationInFrames: introDuration + replayDuration,
          map: map,
          video: {
            videoFile: '/video-cache/Video1.webm',
            durationInFrames: 450,
          },
        }
        curFrame += introDuration + replayDuration
        return acc
      }, {} as CompositionData['clips']),
      introDurationFrames: introDuration,
      framerate: fps,
      resolution: [2560, 1440],
    }

    try {
      const res = await fetch(routes.setActiveComposition.url(), {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          Accept: 'text/plain',
          'Content-Type': 'application/json',
        },
      })
      if (!res.ok) throw new Error('Failed to save composition')
      setIsActive(false)
    } catch (err) {
      console.error(err)
    }
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
