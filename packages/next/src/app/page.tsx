'use client'

import App from '@/components/App'
import theme from '@/theme'
import { MantineProvider } from '@mantine/core'

/*
TODO
- Write function to open remotion preview
*/

// bqADnHDhKOfimntdyJnyu_ltVhj
// FngQSpNTy0ONQre0XDU9oAdEK7b
// ho7WKyIBTV_dNmP9hFFadUvvtLd

export default function Home() {
  return (
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      {/* <AppShell m={0}> */}
      <App />
      {/* </AppShell> */}
    </MantineProvider>
  )
}
