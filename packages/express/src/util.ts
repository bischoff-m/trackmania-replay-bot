import type { Request, Response } from 'express'
import path from 'path'

export const publicRoot = path.join(process.cwd(), '/public')

// TODO: Add this to local .env file
export const userAgent = `
trackmania-replay-bot
https://github.com/bischoff-m/trackmania-replay-bot
Discord: bischoff.m
`
  .trim()
  .replaceAll('\n', ' | ')

export function validateMapID(
  bodyOrParams: Request['body'] | Request['params'],
  res: Response
) {
  // Check if map ID is provided
  if (!bodyOrParams || !Object.hasOwn(bodyOrParams, 'mapID')) {
    res.setHeader('Content-Type', 'text/plain')
    res.status(400).send('No map ID provided')
    return false
  }

  // Check if map ID is valid
  if (!bodyOrParams.mapID.match(/^[a-zA-Z0-9_-]{27}$/)) {
    res.setHeader('Content-Type', 'text/plain')
    res.status(400).send('Invalid map ID')
    return false
  }
  return true
}

export function validateFlagID(
  bodyOrParams: Request['body'] | Request['params'],
  res: Response
) {
  // Check if flag ID is provided
  if (!bodyOrParams || !Object.hasOwn(bodyOrParams, 'flagID')) {
    res.setHeader('Content-Type', 'text/plain')
    res.status(400).send('No flag ID provided')
    return false
  }

  // Check if flag ID is valid
  if (
    bodyOrParams.flagID.length !== 3 ||
    !bodyOrParams.flagID.match(/^[a-zA-Z]+$/)
  ) {
    res.setHeader('Content-Type', 'text/plain')
    res.status(400).send('Invalid flag ID')
    return false
  }
  return true
}
