import MapSelection from '@/components/MapSelection'
import { Center, Flex, clsx, useMantineTheme } from '@mantine/core'

export default function App() {
  const theme = useMantineTheme()
  const fixedStyles = {
    background: theme.colors.dark[7],
  }
  return (
    <main
      className={clsx('h-full', 'w-full', 'top-0', 'left-0', 'absolute')}
      style={{ backgroundColor: fixedStyles.background }}
    >
      <Flex className='h-full'>
        <Center className='flex-1'>{}</Center>
        <MapSelection />
      </Flex>
    </main>
  )
}
