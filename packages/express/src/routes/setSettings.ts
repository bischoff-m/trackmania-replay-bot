import { Settings } from '@global/types'
import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

const rootFile = path.join(process.cwd(), 'public/settings.json')

export async function handleSetSettings(req: Request, res: Response) {
  res.setHeader('Content-Type', 'text/plain')

  if (!req.body) {
    res.status(400).send('No body found')
    return
  }

  const settings: Settings = req.body
  // Check if the trackmaniaRoot is a valid directory
  if (
    !fs.existsSync(settings.trackmaniaRoot) ||
    !fs.statSync(settings.trackmaniaRoot).isDirectory()
  ) {
    res.status(400).send('Invalid trackmaniaRoot')
    return
  }

  try {
    console.log('Writing settings to file')
    fs.writeFileSync(rootFile, JSON.stringify(req.body, null, 2), 'utf-8')
    res.status(200).send('OK')
  } catch (error) {
    res.status(500).send(String(error))
  }
}
