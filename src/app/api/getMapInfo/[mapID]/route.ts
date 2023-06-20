import { MapData, exampleCompData } from '@/globals'
import { NextRequest, NextResponse } from 'next/server'

function getMapData(mapID: string): MapData | null {
  return null
}

export async function GET(
  _: NextRequest,
  { params: { mapID } }: { params: { mapID: string } }
) {
  return NextResponse.json(exampleCompData[mapID].map)
}
