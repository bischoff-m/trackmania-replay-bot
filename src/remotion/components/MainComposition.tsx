import { AbsoluteFill } from 'remotion'
import type { ReplayData } from '@/globals'
import { Clip } from '@@/components/Clip'
import { useEffect } from 'react'
import TrackmaniaIO from 'trackmania.io'

export const MainComposition: React.FC<{
  data: ReplayData
}> = ({ data }) => {
  // useEffect(() => {
  //   console.log('Hi from MainComposition!')
  //   // Initialize client
  //   const client = new TrackmaniaIO.Client()
  //   client.setUserAgent(
  //     'trackmania-replay-bot (https://github.com/bischoff-m/trackmania-replay-bot) | Discord: bischoff.m'
  //   )
  //   // Fetch map and leaderboard
  //   client.maps
  //     .get('z28QXoFnpODEGgg8MOederEVl3j')
  //     .then((map) => {
  //       console.log(
  //         '#################################### SUCCESS ####################################'
  //       )
  //       console.log(String(map))
  //     })
  //     .catch((error) => {
  //       console.log(
  //         '#################################### ERROR ####################################'
  //       )
  //       console.log(error)
  //     })
  // }, [])

  return (
    <>
      <AbsoluteFill>
        {Object.values(data).map((clipData, index) => (
          <Clip key={index} clipNumber={index + 1} clipData={clipData} />
        ))}
      </AbsoluteFill>
    </>
  )
}
