'use client'
/*
TODO
- Write function to open remotion preview
*/

import theme from '@/theme'
import {
  routes,
  type GetCachedMapsResponse,
  type GetMapInfoResponse,
} from '@global/api'
import { AppShell, Button, MantineProvider } from '@mantine/core'
import { Prism } from '@mantine/prism'
import { useState } from 'react'

// bqADnHDhKOfimntdyJnyu_ltVhj
// FngQSpNTy0ONQre0XDU9oAdEK7b
// ho7WKyIBTV_dNmP9hFFadUvvtLd

export default function Home() {
  const [content, setContent] = useState<any>({})

  async function onClickMapInfo() {
    try {
      const fetchRes = await fetch(
        routes.getMapInfo.url('bqADnHDhKOfimntdyJnyu_ltVhj')
      )
      const response = (await fetchRes.json()) as GetMapInfoResponse
      setContent(response)
    } catch (error) {
      setContent({ error: String(error) })
    }
  }

  async function onClickCachedMaps() {
    try {
      const fetchRes = await fetch(routes.getCachedMaps.url())
      const response = (await fetchRes.json()) as GetCachedMapsResponse
      setContent(response)
    } catch (error) {
      setContent({ error: String(error) })
    }
  }

  async function onClickThumbnail() {
    try {
      const fetchRes = await fetch(
        routes.getThumbnail.url('bqADnHDhKOfimntdyJnyu_ltVhj')
      )
      const response = await fetchRes.text()
      setContent(response)
    } catch (error) {
      setContent({ error: String(error) })
    }
  }

  return (
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <AppShell>
        <div className='flex h-full w-full flex-col items-center justify-center'>
          <div className='flex gap-10'>
            <Button variant='outline' onClick={onClickMapInfo}>
              Map Info
            </Button>
            <Button variant='outline' onClick={onClickCachedMaps}>
              Cached Maps
            </Button>
            <Button variant='outline' onClick={onClickThumbnail}>
              Thumbnail
            </Button>
          </div>
          <Prism language='javascript' className='w-full'>
            {JSON.stringify(content, null, 2)}
          </Prism>
        </div>
      </AppShell>
    </MantineProvider>
  )
}
