'use client'
/*
TODO
- Write function to open remotion preview
*/

import theme from '@/theme'
import { GetMapInfoResponse } from '@global/types'
import { AppShell, Button, MantineProvider } from '@mantine/core'
import { Prism } from '@mantine/prism'
import { useState } from 'react'

export default function Home() {
  const [content, setContent] = useState<GetMapInfoResponse>({
    success: false,
    data: {},
    error: 'No data yet',
  })

  async function onClick() {
    try {
      const fetchRes = await fetch(
        'http://localhost:3000/getMapInfo/ho7WKyIBTV_dNmP9hFFadUvvtLd'
      )
      const response = (await fetchRes.json()) as GetMapInfoResponse
      setContent(response)
    } catch (error: any) {
      setContent({
        success: false,
        data: {},
        error: error.message,
      })
    }
  }

  return (
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <AppShell>
        <div className='flex h-full w-full flex-col items-center justify-center'>
          <Button variant='outline' onClick={onClick}>
            Test
          </Button>
          {content.success ? (
            <Prism language='javascript' className='w-full'>
              {JSON.stringify(content.data, null, 2)}
            </Prism>
          ) : (
            <Prism language='markdown' className='w-full'>
              {content.error}
            </Prism>
          )}
        </div>
      </AppShell>
    </MantineProvider>
  )
}
