'use client'
import { useEffect } from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  /* 
  Lazy import because it kept warning me:

  The resource http://localhost/_next/static/css/app/layout.css was 
  preloaded using link preload but not used within a few seconds from the
  window's load event. Please make sure it has an appropriate as value and
  it is preloaded intentionally.
  */
  useEffect(() => {
    import('./global.css')
  }, [])

  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  )
}
