import { CompositionData } from '@global/types'
import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

const rootFile = path.join(process.cwd(), 'public/activeComposition.json')

export async function handleGetActive(req: Request, res: Response) {
  // Set header Access-Control-Allow-Origin to allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const file = fs.readFileSync(rootFile, 'utf-8')
    const activeComposition = JSON.parse(file) as CompositionData
    res.setHeader('Content-Type', 'application/json')
    res.status(200).send(activeComposition)
  } catch (error) {
    res.setHeader('Content-Type', 'text/plain')
    res.status(500).send(String(error))
  }
}
