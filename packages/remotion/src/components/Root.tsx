import { MainComposition } from '@/components/MainComposition'
import '@/style.css'
import { api } from '@global/api'
import type { CompositionData } from '@global/types'
import React, { useEffect, useState } from 'react'
import {
  Composition,
  cancelRender,
  continueRender,
  delayRender,
  getInputProps,
} from 'remotion'

// tmioLink: "https://trackmania.io/#/leaderboard/olsKnq_qAghcVAnEkoeUnVHFZei",
// tmioLink: "https://trackmania.io/#/leaderboard/PhJGvGjkCaw299rBhVsEhNJKX1",
// tmioLink: "https://trackmania.io/#/leaderboard/ho7WKyIBTV_dNmP9hFFadUvvtLd",

// Though it is recommended to load data in the Composition component, instead
// of the Root component, I am loading the data here because I need to know the
// duration of the composition before rendering it.
// https://www.remotion.dev/docs/troubleshooting/defaultprops-too-big#how-to-fix-the-error

export const RemotionRoot: React.FC = () => {
  const [compData, setCompData] = useState<CompositionData | null>(null)
  const [handle] = useState(() => delayRender())

  const inputPropsCLI = getInputProps() as CompositionData

  useEffect(() => {
    if (Object.keys(inputPropsCLI).length > 0) setCompData(inputPropsCLI)
    else {
      api
        .getComposition()
        .then((compData) => {
          setCompData(compData)
          continueRender(handle)
        })
        .catch((err) => {
          console.error(err)
          cancelRender(err)
        })
    }
  }, [inputPropsCLI, handle])

  const duration = compData
    ? Object.values(compData.clips).reduce(
        (sum, clip) => sum + clip.durationInFrames,
        0
      )
    : 1

  return (
    <>
      <Composition
        id='MainComposition'
        component={MainComposition}
        durationInFrames={duration}
        fps={60}
        width={2560}
        height={1440}
        defaultProps={{ data: compData }}
      />
    </>
  )
}
