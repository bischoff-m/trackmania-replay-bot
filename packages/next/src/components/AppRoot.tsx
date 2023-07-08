import MapSelection from '@/components/MapView/MapView'
import SaveButton from '@/components/SaveButton'
import { api } from '@global/api'
import { ClipData, CompositionData } from '@global/types'
import { Center, Flex, clsx, useMantineTheme } from '@mantine/core'
import { createFormContext } from '@mantine/form'
import { useEffect, useState } from 'react'

// createFormContext returns a tuple with 3 items:
// FormProvider is a component that sets form context
// useFormContext hook return form object that was previously set in FormProvider
// useForm hook works the same way as useForm exported from the package but has predefined type
const [FormProvider, useFormContext, useForm] =
  createFormContext<CompositionData>()

export { useFormContext }

export default function AppRoot() {
  const theme = useMantineTheme()
  const fixedStyles = {
    background: theme.colors.dark[7],
  }
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [ignoreChanges, setIgnoreChanges] = useState(true)

  const form = useForm({
    initialValues: {
      clips: [],
      framerate: 60,
      resolution: [2560, 1440],
      introDurationFrames: 5 * 60,
    },
  })

  useEffect(() => {
    // Wait for form to be initialized
    setTimeout(() => setIgnoreChanges(false), 300)
  }, [])

  return (
    <main
      className={clsx('h-full', 'w-full', 'top-0', 'left-0', 'absolute')}
      style={{ backgroundColor: fixedStyles.background }}
    >
      <SaveButton isActive={unsavedChanges} />
      <FormProvider form={form}>
        <Flex className='h-full'>
          <form
            // This is referenced by <Button form='composition-form' ... />
            id='composition-form'
            onSubmit={form.onSubmit(async () => {
              // Send CompositionData to server
              api
                .setComposition(form.values)
                .then(() => {
                  setUnsavedChanges(false)
                })
                .catch((err) => {
                  console.error(err)
                })
            })}
          ></form>
          <Center className='flex-1'>{}</Center>
          <MapSelection
            onChange={(activeMaps) => {
              // Calculate clips from activeMaps
              let curFrame = 0
              const introDuration = form.values.introDurationFrames
              const selectedClips = activeMaps.map((mapData) => {
                const fps = form.values.framerate
                const replayDuration = mapData.video?.durationInFrames ?? fps // 1 second
                const clipData: ClipData = {
                  mapID: mapData.id,
                  startFrame: curFrame,
                  durationInFrames: introDuration + replayDuration,
                }
                curFrame += introDuration + replayDuration
                return clipData
              })

              // Compare clips from form with activeMaps
              if (
                JSON.stringify(form.values.clips) !==
                JSON.stringify(selectedClips)
              ) {
                form.setFieldValue('clips', selectedClips)
                ignoreChanges || setUnsavedChanges(true)
              }
            }}
          />
        </Flex>
      </FormProvider>
    </main>
  )
}
