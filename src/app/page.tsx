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
import TrackmaniaIO from 'trackmania.io'
import Test, { getServerSideProps } from '@/components/Test'

async function onClick() {
  const res = await fetch('/api/getMapInfo/ho7WKyIBTV_dNmP9hFFadUvvtLd')
  const text = await res.text()
  console.log(text)
}

export default function Home() {
  const [content, setContent] = useState('')

  useEffect(() => {
    // fetch('/api/getMapInfo/ho7WKyIBTV_dNmP9hFFadUvvtLd')
    //   .then((res) => res.text())
    //   .then((text) => setContent(text))
    // getServerSideProps().then((res) => setContent(res.props.data))
  }, [])

  return (
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <AppShell>
        <div className='flex h-full w-full items-center justify-center'>
          <Button variant='light' onClick={onClick}>
            Test
          </Button>
          <Test />
          <p>{content}</p>
        </div>
      </AppShell>
    </MantineProvider>
  )
}
