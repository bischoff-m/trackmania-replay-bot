'use client'

import AppRoot from '@/components/AppRoot'
import { mantineTheme } from '@/theme'
import { MantineProvider } from '@mantine/core'

export default function Home() {
  return (
    <MantineProvider theme={mantineTheme} withGlobalStyles withNormalizeCSS>
      <AppRoot />
    </MantineProvider>
  )
}
