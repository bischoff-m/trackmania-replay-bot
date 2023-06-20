import { Video, staticFile } from 'remotion'
import { useClipContext } from '@@/components/Clip'

export const ReplayVideo: React.FC = () => {
  const clipData = useClipContext()
  return <Video src={staticFile(clipData.video.videoFile)} className='z-0' />
}
