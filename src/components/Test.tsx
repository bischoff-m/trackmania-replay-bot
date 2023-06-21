import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import TrackmaniaIO from 'trackmania.io'

// export async function getServerSideProps() {
// }
export const getServerSideProps: GetServerSideProps = async () => {
  console.log('getServerSideProps')
  const client = new TrackmaniaIO.Client()
  client.setUserAgent(
    'trackmania-replay-bot (https://github.com/bischoff-m/trackmania-replay-bot) | Discord: bischoff.m'
  )

  let map = await client.maps.get('z28QXoFnpODEGgg8MOederEVl3j')
  console.log(String(map))
  let data = JSON.stringify(map)

  return { props: { data } }
}

export default function Test({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <h1>Test</h1>
      <p>{data}</p>
    </>
  )
}
