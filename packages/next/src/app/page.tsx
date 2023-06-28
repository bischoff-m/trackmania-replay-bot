'use client'

import App from '@/components/App'
import { mantineTheme } from '@/theme'
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
    <MantineProvider theme={mantineTheme} withGlobalStyles withNormalizeCSS>
      <App />
    </MantineProvider>
  )
}
