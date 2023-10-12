import { RenderFormState, useRenderFormContext } from '@/components/AppRoot'
import MapListItem from '@/components/MapView/MapListItem'
import { MapData } from '@global/types'
import { Button, Container, Flex, Modal, Table, Text } from '@mantine/core'

const settingsDescription: {
  [key in keyof RenderFormState]?: string
} = {
  framerate: 'Frame rate',
  resolution: 'Resolution',
}

function validateMapForRender(map: MapData) {
  return (
    // Has to have a replay
    map.replayUrl &&
    // Has to have a ghost
    map.ghostUrl &&
    // There should not be a video to avoid overwriting
    !map.video
  )
}

export default function RenderModal({
  opened,
  close,
  maps,
  onAccept,
}: {
  opened: boolean
  close: () => void
  maps: MapData[]
  onAccept: () => void
}) {
  const form = useRenderFormContext()
  const faultyMaps = maps.filter((map) => !validateMapForRender(map))
  const validateSuccess = faultyMaps.length === 0

  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      size='xl'
      withCloseButton={false}
    >
      <Flex direction='column' gap='md'>
        <Container m={0} p='xs'>
          {validateSuccess ? (
            <>
              <Text size='md' weight={500}>
                Do you want to render with these settings?
              </Text>
              <Text size='sm' color='dimmed'>
                This will try to start Trackmania.exe with instructions to batch
                render the selected replays.
              </Text>
            </>
          ) : (
            <>
              <Text size='md' weight={500}>
                Some maps cannot be rendered
              </Text>
              <Text size='sm' color='dimmed'>
                There are maps that do not meet the requirements for rendering.
                Please check the following maps:
              </Text>
            </>
          )}
        </Container>

        {/* Maps */}
        <Flex direction='column'>
          {(validateSuccess ? maps : faultyMaps).map((mapData, index) => (
            <MapListItem key={index} map={mapData} height={70} />
          ))}
        </Flex>

        {/* Settings */}
        {validateSuccess && (
          <Table>
            <tbody>
              {Object.entries(form.values).map(([key, value]) => {
                const description =
                  settingsDescription[key as keyof RenderFormState]
                if (!description) return null

                return (
                  <tr key={key}>
                    <td>
                      <Text weight={500}>{description}</Text>
                    </td>
                    <td>{JSON.stringify(value)}</td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        )}

        {/* Buttons */}
        <Flex justify='end' gap='md'>
          <Button variant='light' color='red' onClick={close}>
            Cancel
          </Button>
          {validateSuccess && (
            <Button
              variant='filled'
              color='green'
              onClick={() => {
                onAccept()
                close()
              }}
            >
              Render
            </Button>
          )}
        </Flex>
      </Flex>
    </Modal>
  )
}
