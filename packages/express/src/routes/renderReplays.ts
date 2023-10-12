import { Clients } from '@/index'
import { resolvePublic } from '@/util'
import { api } from '@global/api'
import { MapData } from '@global/types'
import { spawn } from 'child_process'
import { Request, Response } from 'express'
import ffprobeStatic from 'ffprobe-static'
import fs from 'fs'
import path from 'path'

// Configuration object for rendering tasks
type Config = {
  trackmaniaRoot: string
  renderTasks: RenderTask[]
}

// Object representing a single rendering task
type RenderTask = {
  ghostPath: string
  replayPath: string
  outputPath: string
}

/**
 * Returns the number of frames in a video file.
 * @param videoPath The path to the video file.
 * @returns A Promise that resolves to the number of frames in the video.
 */
async function getVideoFrames(videoPath: string) {
  return new Promise<number>((resolve, reject) => {
    // Use ffprobe to get the number of frames in the video
    // https://stackoverflow.com/questions/2017843/fetch-frame-count-with-ffmpeg
    const ffprobe = spawn(ffprobeStatic.path, [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-count_packets',
      '-show_entries',
      'stream=nb_read_packets',
      '-of',
      'csv=p=0',
      videoPath,
    ])
    ffprobe.stdout.on('data', function (data: string) {
      const parsed = Number(data)
      if (isNaN(parsed)) reject(new Error('Could not parse frame count'))
      else resolve(parsed)
    })
    ffprobe.stderr.on('data', function (data: any) {
      reject(new Error(data.toString()))
    })
    ffprobe.on('close', function (code: any) {
      if (code !== 0) reject(new Error('ffprobe exited with code ' + code))
      else resolve(0)
    })
  })
}

/**
 * Handles a request to render replays for a set of maps.
 * @param req The HTTP request object.
 * @param res The HTTP response object.
 * @param clients An object containing connected clients.
 */
export async function handleRenderReplays(
  req: Request,
  res: Response,
  clients: Clients
) {
  res.setHeader('Content-Type', 'text/plain')

  if (!req.body) {
    res.status(400).send('No body found')
    return
  }
  res.status(200).send('OK')

  // Create a map of tasks to render for each map ID in the request body
  let tasks: { [mapID: string]: RenderTask } = {}
  for (const mapID of req.body) {
    const mapData = await api.getMap(mapID)
    if (!mapData.ghostUrl || !mapData.replayUrl) {
      console.log('No ghost or no replay found')
      continue
    }
    tasks[mapID] = {
      ghostPath: resolvePublic(mapData.ghostUrl),
      replayPath: resolvePublic(mapData.replayUrl),
      outputPath: resolvePublic(`/public/maps/${mapID}/video.webm`),
    }
  }

  // Get the TrackMania settings from the API
  const settings = await api.getSettings()

  // Create a configuration object for the rendering tasks
  const config: Config = {
    trackmaniaRoot: settings.trackmaniaRoot,
    renderTasks: Object.values(tasks),
  }

  // Run the Python script to render the replays
  const root = path.resolve(process.cwd() + '/../render')
  const python = path.resolve(root + '/.venv/Scripts/python')
  const args = ['./src/main.py', '--json', JSON.stringify(config)]
  const options = { cwd: root }
  const pyProgram = spawn(python, args, options)

  // Log output from the Python script
  pyProgram.stdout.on('data', function (data: any) {
    const lines = data.toString().split('\n')
    lines.forEach((line: string) => {
      console.log('[python] ' + line)
    })
  })
  pyProgram.stderr.on('data', function (data: any) {
    const lines = data.toString().split('\n')
    lines.forEach((line: string) => {
      console.log('[python] ' + line)
    })
  })

  // Update map info and notify clients when the rendering is complete
  pyProgram.on('close', async function (code: any) {
    console.log('Python script exited with code ' + code)

    // Update map info
    for (const [mapID, task] of Object.entries(tasks)) {
      if (!fs.existsSync(task.outputPath)) continue

      const infoPath = resolvePublic(`/public/maps/${mapID}/info.json`)
      const info = JSON.parse(fs.readFileSync(infoPath, 'utf8')) as MapData

      const videoUrl = `/public/maps/${mapID}/video.webm`
      let frames = 0
      try {
        frames = await getVideoFrames(resolvePublic(videoUrl))
        console.log(frames)
      } catch (error) {
        console.log(error)
      }
      info.video = {
        url: videoUrl,
        durationInFrames: frames,
        // TODO: Send resolution and framerate for req.body
        resolution: [123, 123],
        framerate: 42,
      }
      fs.writeFileSync(infoPath, JSON.stringify(info, null, 2))
    }

    // Notify clients
    Object.values(clients).forEach((client) =>
      client.write(`data: MAPUPDATE\n\n`)
    )
  })
}
