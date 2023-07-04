import { userAgent } from '@/index'
import type { Request, Response } from 'express'
import fs from 'fs'
import nodeFetch from 'node-fetch'
import path from 'path'

const cacheRoot = path.join(process.cwd(), '/public/flags')

async function fetchNewFlag(flagID: string) {
  const url = `https://trackmania.io/img/flags/${flagID}.jpg`
  const filePath = path.join(cacheRoot, `/${flagID}.jpg`)

  // Fetch flag image from trackmania.io website
  const response = await nodeFetch(url, {
    headers: { 'User-Agent': userAgent, Accept: 'image/jpeg, image/png' },
  })
  if (!response.ok || response.body === null)
    throw new Error(`Failed to fetch ${url}`)

  // Write to cache
  await fs.promises.writeFile(filePath, response.body)
}

export async function handleGetFlag(req: Request, res: Response) {
  // Set header Access-Control-Allow-Origin to allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*')

  // Check if flag ID is provided
  if (!Object.hasOwn(req.params, 'flagID')) {
    res.setHeader('Content-Type', 'text/plain')
    res.status(400).send('No flag ID provided')
    return
  }
  const flagID = req.params.flagID

  // Check if flag ID is valid
  if (flagID.length !== 3 || !flagID.match(/^[a-zA-Z]+$/)) {
    res.setHeader('Content-Type', 'text/plain')
    res.status(400).send('Invalid flag ID')
    return
  }

  // Try to load from cache
  const filePath = path.join(cacheRoot, `/${flagID}.jpg`)
  if (fs.existsSync(filePath)) {
    res.status(200).sendFile(filePath)
    return
  }

  // Fetch new flag
  console.log(`Fetching new flag ${flagID}`)
  try {
    await fetchNewFlag(flagID)
    res.status(200).sendFile(filePath)
  } catch (err) {
    console.error(err)
    res.setHeader('Content-Type', 'text/plain')
    res.status(500).send('Failed to fetch flag')
  }
}
