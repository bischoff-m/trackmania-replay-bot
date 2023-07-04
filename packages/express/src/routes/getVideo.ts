import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

const rootPath = path.join(process.cwd(), 'public/videos')

export async function handleGetVideo(req: Request, res: Response) {
  // Set header Access-Control-Allow-Origin to allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*')

  // Check if map ID is provided
  if (!Object.hasOwn(req.params, 'videoName')) {
    res.setHeader('Content-Type', 'text/plain')
    res.status(400).send('No video file name provided')
    return
  }

  // Check if map ID is valid
  const videoName = req.params.videoName
  if (!videoName.match(/^[a-zA-Z0-9_-]{27}.webm$/)) {
    res.setHeader('Content-Type', 'text/plain')
    res.status(400).send('Invalid video file name')
    return
  }

  const videoPath = path.join(rootPath, videoName)
  try {
    if (!fs.existsSync(videoPath)) throw new Error('Video file not found')
    res.status(200).sendFile(videoPath)
  } catch (error) {
    res.setHeader('Content-Type', 'text/plain')
    res.status(500).send(String(error))
  }
}
