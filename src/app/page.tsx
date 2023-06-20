'use client'
/*
TODO
- Write function to open remotion preview
- Write trackmania.io data to file
- Serve file to remotion
*/

import { AppShell, Button, MantineProvider } from '@mantine/core'
import theme from '@/theme'

export default function Home() {
  return (
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <AppShell>
        <div className='flex h-full w-full items-center justify-center'>
          <Button variant='light'>PREVIEW</Button>
        </div>
      </AppShell>
    </MantineProvider>
  )
}
