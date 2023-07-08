import { Clients } from '@/index'
import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'

export async function onEvent(req: Request, res: Response, clients: Clients) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  })
  res.write('data: Connected\n\n')

  const clientId = uuidv4()
  console.log(`${clientId} Connection opened`)

  clients[clientId] = res

  res.on('close', () => {
    console.log(`${clientId} Connection closed`)
    delete clients[clientId]
  })
}
