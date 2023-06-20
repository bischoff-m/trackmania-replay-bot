'use client'
/*
TODO
- Write function to open remotion preview
- Write trackmania.io data to file
- Serve file to remotion
*/

import { AppShell, Button, MantineProvider } from '@mantine/core'
import theme from '@/theme'
import { useEffect, useState } from 'react'

export default function Home() {
  const [content, setContent] = useState('')

  useEffect(() => {
    fetch('/api/getMapInfo/olsKnq_qAghcVAnEkoeUnVHFZei')
      .then((res) => res.text())
      .then((text) => setContent(text))
  }, [])

  return (
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <AppShell>
        <div className='flex h-full w-full items-center justify-center'>
          <Button variant='light'>PREVIEW</Button>
          <p>{content}</p>
        </div>
      </AppShell>
    </MantineProvider>
  )
}
