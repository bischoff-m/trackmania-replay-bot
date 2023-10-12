import { resolvePublic } from '@/util'
import { CompositionData, Settings } from '@global/types'
import fs from 'fs'

const fileTemplates: {
  [key: string]: CompositionData | Settings
} = {
  'activeComposition.json': {
    clips: [],
    introDurationSeconds: 5,
    resolution: [2560, 1440],
    framerate: 60,
  },
  'settings.json': {
    trackmaniaRoot: '',
  },
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
