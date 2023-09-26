import { resolvePublic } from '@/util'
import { CompositionData, Settings } from '@global/types'
import fs from 'fs'

const fileTemplates = {
  'activeComposition.json': {
    clips: [],
    framerate: 60,
    resolution: [2560, 1440],
    introDurationFrames: 300,
  } as CompositionData,
  'settings.json': {
    trackmaniaRoot: '',
  } as Settings,
}
const requiredDirs = ['maps', 'flags']

export async function initPublic() {
  // Create required files
  for (const [fileName, template] of Object.entries(fileTemplates)) {
    const filePath = resolvePublic(`public/${fileName}`)
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(template, null, 2), 'utf-8')
    }
  }
  // Create required directories
  for (const dirName of requiredDirs) {
    const dirPath = resolvePublic(`public/${dirName}`)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath)
    }
  }
}
