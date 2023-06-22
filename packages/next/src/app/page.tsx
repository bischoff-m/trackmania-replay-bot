'use client'
/*
TODO
- Write function to open remotion preview
*/

import { AppShell, Button, MantineProvider } from '@mantine/core'
import theme from '@/theme'
import { exampleReplays } from '@global/examples'

export default function Home() {
  return (
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <AppShell>
        <div className='flex h-full w-full flex-col items-center justify-center'>
          <Button variant='light'>Test</Button>
          <p>{JSON.stringify(exampleReplays)}</p>
        </div>
      </AppShell>
    </MantineProvider>
  )
}
