import { Config } from 'remotion'
import { enableTailwind } from '@remotion/tailwind'
import path from 'path'

Config.setPort(5000)

Config.setPublicDir('./public')
Config.setEntryPoint('./src/index.ts')
Config.setOutputLocation('../../output/output.mp4')

Config.setShouldOpenBrowser(true)
Config.setChromiumHeadlessMode(false)

Config.overrideWebpackConfig((config) => {
  const newConfig = enableTailwind(config)
  return {
    ...newConfig,
    resolve: {
      ...newConfig.resolve,
      alias: {
        ...(newConfig.resolve?.alias ?? {}),
        '@': path.join(process.cwd(), 'src'),
        '@global': path.join(process.cwd(), '../global'),
      },
    },
  }
})
