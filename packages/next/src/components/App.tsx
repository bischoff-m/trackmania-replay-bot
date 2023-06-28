import MapSelect from '@/components/MapSelect'
import { Flex } from '@mantine/core'

export default function App() {
  return (
    <main className='h-full w-full top-0 left-0 absolute'>
      <Flex className='h-full'>
        <div className='flex-1'></div>
        <MapSelect />
      </Flex>
    </main>
  )
}
