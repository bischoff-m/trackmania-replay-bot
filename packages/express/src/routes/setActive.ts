import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

const rootFile = path.join(process.cwd(), 'public/activeComposition.json')

export async function handleSetActive(req: Request, res: Response) {
  // Set header Access-Control-Allow-Origin to allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'text/plain')

  if (!req.body) {
    res.status(400).send('No body found')
    return
  }

  try {
    console.log('Writing active composition to file')
    fs.writeFileSync(rootFile, JSON.stringify(req.body, null, 2), 'utf-8')
    res.status(200).send('OK')
  } catch (error) {
    res.status(500).send(String(error))
  }
}
