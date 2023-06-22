import { useClipContext } from '@/components/Clip'
import { Video, staticFile } from 'remotion'

export const ReplayVideo: React.FC = () => {
  const clipData = useClipContext()
  return <Video src={staticFile(clipData.video.videoFile)} className='z-0' />
}
