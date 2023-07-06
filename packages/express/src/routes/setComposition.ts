import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

const rootFile = path.join(process.cwd(), 'public/activeComposition.json')

export async function handleSetComposition(req: Request, res: Response) {
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
