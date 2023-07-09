import { useCompositionFormContext } from '@/components/AppRoot'
import RenderModal from '@/components/MapView/RenderModal'
import { api } from '@global/api'
import { MapData } from '@global/types'
import { ActionIcon, Button, Flex } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { UseListState } from '@mantine/hooks/lib/use-list-state/use-list-state'
import { IconTrash } from '@tabler/icons-react'

export default function MapViewHeader({
  height,
  setDirty,
  cachedState,
  activeState,
}: {
  height: number
  setDirty: (dirty: boolean) => void
  cachedState: UseListState<MapData>
  activeState: UseListState<MapData>
}) {
  // Modal to start render process
  const [opened, { open, close }] = useDisclosure(false)

  const form = useCompositionFormContext()

  const [mapsCached, handlersCached] = cachedState
  const [mapsActive, handlersActive] = activeState

  return (
    <>
      {/* Modal for starting render process */}
      <RenderModal
        opened={opened}
        close={close}
        maps={mapsActive.filter((map) => !map.video)}
        onAccept={() =>
          api
            .renderReplays(
              mapsActive.filter((map) => !map.video).map((map) => map.id)
            )
            .then(() => {
              // TODO: Replace this with a proper notification
              console.log('Started rendering')
            })
            .catch((err) => {
              console.error(err)
            })
        }
      />

      {/* Header */}
      <Flex
        className='w-full p-1 gap-2 justify-end items-center'
        style={{ height: height }}
      >
        <Button
          variant='subtle'
          compact
          onClick={open}
          style={{ height: height * 0.8 }}
        >
          Render
        </Button>
        <ActionIcon
          size={height * 0.8}
          title='Set all inactive'
          color='primary'
          onClick={() => {
            if (mapsActive.length === 0) return
            const newCached = [...mapsActive, ...mapsCached]
            handlersActive.setState([])
            handlersCached.setState(newCached)
            setDirty(true)
          }}
        >
          <IconTrash size='1.1rem' />
        </ActionIcon>
      </Flex>
    </>
  )
}
