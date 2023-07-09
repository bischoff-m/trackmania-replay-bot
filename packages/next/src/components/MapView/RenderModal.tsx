import { useCompositionFormContext } from '@/components/AppRoot'
import MapListItem from '@/components/MapView/MapListItem'
import { CompositionData, MapData } from '@global/types'
import { Button, Container, Flex, Modal, Table, Text } from '@mantine/core'

const settingsDescription: {
  [key in keyof CompositionData]?: string
} = {
  framerate: 'Frame rate',
  resolution: 'Resolution',
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
  const form = useCompositionFormContext()

  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      size='auto'
      withCloseButton={false}
    >
      <Flex direction='column' gap='md'>
        <Container p='xs'>
          <Text size='md' weight={500}>
            Do you want to render with these settings?
          </Text>
          <Text size='sm' color='dimmed'>
            This will try to start Trackmania.exe with instructions to batch
            render the selected replays.
          </Text>
        </Container>
        <Flex direction='column'>
          {maps.map((mapData, index) => (
            <MapListItem key={index} map={mapData} width={500} height={70} />
          ))}
        </Flex>
        <Table>
          <tbody>
            {Object.entries(form.values).map(([key, value]) => {
              const description =
                settingsDescription[key as keyof CompositionData]
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
        <Flex justify='end' gap='md'>
          <Button variant='light' color='red' onClick={close}>
            Cancel
          </Button>
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
        </Flex>
      </Flex>
    </Modal>
  )
}
