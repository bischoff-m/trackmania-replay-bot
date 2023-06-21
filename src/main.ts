import express from 'express'
import TrackmaniaIO from 'trackmania.io'

const app = express()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(3000, () => {
  console.log('Example app is listening on port 3000.')
  // test()
})

async function test() {
  console.log('Hi from test()')
  // Initialize client
  const client = new TrackmaniaIO.Client()
  client.setUserAgent(
    'trackmania-replay-bot (https://github.com/bischoff-m/trackmania-replay-bot) | Discord: bischoff.m'
  )
  // Fetch map and leaderboard
  client.maps
    .get('z28QXoFnpODEGgg8MOederEVl3j')
    .then((map) => {
      console.log(
        '#################################### SUCCESS ####################################'
      )
      console.log(JSON.stringify(map))
    })
    .catch((error) => {
      console.log(
        '#################################### ERROR ####################################'
      )
      console.log(error)
    })
}
