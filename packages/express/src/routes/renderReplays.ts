import { Clients } from '@/index'
import { resolvePublic } from '@/util'
import { api } from '@global/api'
import { MapData } from '@global/types'
import { spawn } from 'child_process'
import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

type Config = {
  trackmaniaRoot: string
  renderTasks: RenderTask[]
}

type RenderTask = {
  ghostPath: string
  replayPath: string
  outputPath: string
}

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

  const settings = await api.getSettings()
  const config: Config = {
    trackmaniaRoot: settings.trackmaniaRoot,
    renderTasks: Object.values(tasks),
  }

  const root = path.resolve(process.cwd() + '/../render')
  const python = path.resolve(root + '/.venv/Scripts/python')
  const args = ['./src/main.py', '--json', JSON.stringify(config)]
  const options = { cwd: root }
  const pyProgram = spawn(python, args, options)

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
  pyProgram.on('close', function (code: any) {
    console.log('Python script exited with code ' + code)

    // Update map info
    Object.entries(tasks).forEach(([mapID, task]) => {
      if (!fs.existsSync(task.outputPath)) return

      const videoUrl = `/public/maps/${mapID}/video.webm`
      const infoPath = resolvePublic(`/public/maps/${mapID}/info.json`)
      const info = JSON.parse(fs.readFileSync(infoPath, 'utf8')) as MapData
      info.video = {
        url: videoUrl,
        durationInFrames: 120,
      }
      fs.writeFileSync(infoPath, JSON.stringify(info, null, 2))
    })

    // Notify clients
    Object.values(clients).forEach((client) =>
      client.write(`data: MAPUPDATE\n\n`)
    )
  })
}
