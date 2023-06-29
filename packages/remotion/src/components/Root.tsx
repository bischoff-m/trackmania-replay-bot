import { MainComposition } from '@/components/MainComposition'
import '@/style.css'
import { routes } from '@global/api'
import type { CompositionData } from '@global/types'
import React, { useEffect } from 'react'
import { Composition, getInputProps } from 'remotion'

// TODO: Define base path /public/remotion in global variable

// tmioLink: "https://trackmania.io/#/leaderboard/olsKnq_qAghcVAnEkoeUnVHFZei",
// tmioLink: "https://trackmania.io/#/leaderboard/PhJGvGjkCaw299rBhVsEhNJKX1",
// tmioLink: "https://trackmania.io/#/leaderboard/ho7WKyIBTV_dNmP9hFFadUvvtLd",

export const RemotionRoot: React.FC = () => {
  const [compData, setCompData] = React.useState<CompositionData | null>(null)
  const inputPropsCLI = getInputProps() as CompositionData

  /*
  Idea:
  If CLI props are given, use them
  Otherwise try to read from file to have live reload
  Else don't render anything and show error message
  */

  useEffect(() => {
    if (Object.keys(inputPropsCLI).length > 0) setCompData(inputPropsCLI)
    else {
      fetch(routes.getActiveComposition.url(), {
        headers: { Accept: 'application/json' },
      }).then(async (res) => {
        if (!res.ok) {
          console.error(await res.text())
          return
        }

        const compData = (await res.json()) as CompositionData
        setCompData(compData)
      })
    }
  }, [inputPropsCLI])

  return (
    <>
      {compData && (
        <Composition
          id='MainComposition'
          component={MainComposition}
          durationInFrames={Object.values(compData.clips).reduce(
            (sum, clip) => sum + clip.durationInFrames,
            0
          )}
          fps={60}
          width={2560}
          height={1440}
          defaultProps={compData}
        />
      )}
    </>
  )
}
