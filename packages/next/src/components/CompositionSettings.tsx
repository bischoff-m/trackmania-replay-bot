import { useCompositionFormContext } from '@/components/AppRoot'
import { Button, Flex, NumberInput, Title } from '@mantine/core'

const resolutionPresets = [
  [3840, 2160],
  [2560, 1440],
  [1920, 1080],
  [1280, 720],
]

const frameratePresets = [120, 60, 30, 24]

export default function CompositionSettings() {
  const form = useCompositionFormContext()

  return (
    <Flex direction='column' className='h-full gap-6 justify-center'>
      <Title order={2}>Composition Settings</Title>

      {/* Resolution */}
      <Flex direction='column' gap='xs'>
        <Flex gap='md'>
          <NumberInput
            label='Width'
            min={1}
            hideControls
            value={form.values.resolution[0]}
            onChange={(num) => {
              if (num === '') return
              form.setFieldValue('resolution.0', num)
              form.setDirty({ resolution: true })
            }}
          />
          <NumberInput
            label='Height'
            min={1}
            hideControls
            value={form.values.resolution[1]}
            onChange={(num) => {
              if (num === '') return
              form.setFieldValue('resolution.1', num)
              form.setDirty({ resolution: true })
            }}
          />
        </Flex>
        <Flex gap='xs'>
          {resolutionPresets.map(([width, height]) => (
            <Button
              key={width * height}
              size='xs'
              radius='xl'
              variant={
                form.values.resolution.join('x') === `${width}x${height}`
                  ? 'filled'
                  : 'light'
              }
              compact
              onClick={() => {
                form.setFieldValue('resolution', [width, height])
                form.setDirty({ resolution: true })
              }}
            >
              {height}p
            </Button>
          ))}
        </Flex>
      </Flex>

      {/* Frame rate */}
      <Flex direction='column' gap='xs'>
        <NumberInput
          label='Frame rate'
          min={1}
          hideControls
          value={form.values.framerate}
          onChange={(num) => {
            if (num === '') return
            form.setFieldValue(
              'introDurationFrames',
              (form.values.introDurationFrames / form.values.framerate) * num
            )
            form.setFieldValue('framerate', num)
            form.setDirty({ framerate: true })
          }}
        />
        <Flex gap='xs'>
          {frameratePresets.map((framerate) => (
            <Button
              key={framerate}
              size='xs'
              radius='xl'
              variant={form.values.framerate === framerate ? 'filled' : 'light'}
              compact
              onClick={() => {
                form.setFieldValue(
                  'introDurationFrames',
                  (form.values.introDurationFrames / form.values.framerate) *
                    framerate
                )
                form.setFieldValue('framerate', framerate)
                form.setDirty({ framerate: true })
              }}
            >
              {framerate}fps
            </Button>
          ))}
        </Flex>
      </Flex>

      {/* Intro Duration */}
      <NumberInput
        label='Intro Duration (seconds)'
        min={0}
        value={form.values.introDurationFrames / form.values.framerate}
        onChange={(num) => {
          form.setFieldValue(
            'introDurationFrames',
            (num !== '' ? num : 1) * form.values.framerate
          )
          form.setDirty({ introDurationFrames: true })
        }}
      />
    </Flex>
  )
}
