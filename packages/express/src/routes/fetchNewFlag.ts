import { resolvePublic, userAgent, validateFlagID } from '@/util'
import { Request, Response } from 'express'
import fs from 'fs/promises'
import nodeFetch from 'node-fetch'

export async function handleFetchNewFlag(req: Request, res: Response) {
  if (!validateFlagID(req.params, res)) return

  const { flagID } = req.params
  const url = `https://trackmania.io/img/flags/${flagID}.jpg`

  try {
    // Fetch flag image from trackmania.io website
    console.log(`Fetching new flag ${flagID}`)
    const response = await nodeFetch(url, {
      headers: { 'User-Agent': userAgent, Accept: 'image/jpeg, image/png' },
    })
    if (!response.ok || response.body === null)
      throw new Error(`Failed to fetch ${url}`)

    // Write to cache
    const filePath = resolvePublic(`/public/flags/${flagID}.jpg`)
    await fs.writeFile(filePath, response.body)
    // Send file
    res.status(200).sendFile(filePath)
  } catch (error) {
    console.error(error)
    res.setHeader('Content-Type', 'text/plain')
    res.status(500).send('Failed to fetch flag')
  }
}
