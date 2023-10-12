import RenderModal from '@/components/MapView/RenderModal'
import { api } from '@global/api'
import { MapData } from '@global/types'
import { ActionIcon, Button, Flex, Tooltip } from '@mantine/core'
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
  // Modal
  const [opened, { open, close }] = useDisclosure(false)

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
        }
      />

      {/* Header */}
      <Flex
        className='w-full p-1 gap-2 justify-end items-center'
        style={{ height: height }}
      >
        <Tooltip
          label='Batch render all active clips without video in remotion'
          withinPortal
          multiline
        >
          <Button
            variant='subtle'
            compact
            onClick={open}
            style={{ height: height * 0.8 }}
          >
            Render
          </Button>
        </Tooltip>
        <Tooltip label='Set all inactive' withinPortal>
          <ActionIcon
            size={height * 0.8}
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
        </Tooltip>
      </Flex>
    </>
  )
}
