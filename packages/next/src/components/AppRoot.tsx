import CompositionSettings from '@/components/CompositionSettings'
import MapView from '@/components/MapView/MapView'
import SaveButton from '@/components/SaveButton'
import { api } from '@global/api'
import { CompositionData } from '@global/types'
import { Center, Flex, clsx, useMantineTheme } from '@mantine/core'
import { createFormContext } from '@mantine/form'
import { useEffect } from 'react'

const [CompositionFormProvider, useCompositionFormContext, useCompositionForm] =
  createFormContext<CompositionData>()

export { useCompositionFormContext }

export default function AppRoot() {
  const theme = useMantineTheme()
  const fixedStyles = {
    background: theme.colors.dark[7],
  }

  const form = useCompositionForm({
    initialValues: {
      clips: [],
      framerate: 60,
      resolution: [2560, 1440],
      introDurationFrames: 5 * 60,
    },
    initialDirty: {
      clips: false,
      framerate: false,
      resolution: false,
      introDurationFrames: false,
    },
  })

  useEffect(() => {
    api
      .getComposition()
      .then((data) => {
        form.setValues(data)
      })
      .catch((err) => {
        console.error(err)
      })
  }, [])

  return (
    <main
      className={clsx('h-full', 'w-full', 'top-0', 'left-0', 'fixed')}
      style={{ backgroundColor: fixedStyles.background }}
    >
      <SaveButton isActive={form.isDirty()} />
      <CompositionFormProvider form={form}>
        <Flex className='h-full'>
          <form
            // This is referenced by <Button form='composition-form' ... />
            id='composition-form'
            onSubmit={form.onSubmit(async () => {
              // Send CompositionData to server
              api
                .setComposition(form.values)
                .then(() => {
                  form.resetDirty()
                })
                .catch((err) => {
                  console.error(err)
                })
            })}
          ></form>
          <Center className='flex-1'>
            <CompositionSettings />
          </Center>
          <MapView />
        </Flex>
      </CompositionFormProvider>
    </main>
  )
}
