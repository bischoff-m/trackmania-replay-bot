import { resolvePublic } from '@/util'
import { Request, Response } from 'express'
import fs from 'fs'

export async function handleMapIndex(req: Request, res: Response) {
  const mapsDir = resolvePublic(`/public/maps`)

  try {
    let subDirs = fs.readdirSync(mapsDir, { withFileTypes: true })
    subDirs = subDirs.filter((dir) => dir.isDirectory())
    subDirs = subDirs.filter((dir) => dir.name.match(/^[a-zA-Z0-9_-]{27}$/))

    res.setHeader('Content-Type', 'application/json')
    res.status(200).send(JSON.stringify(subDirs.map((dir) => dir.name)))
  } catch (error) {
    console.error(error)
    res.setHeader('Content-Type', 'text/plain')
    res.status(500).send('Failed to load map index')
  }
}
