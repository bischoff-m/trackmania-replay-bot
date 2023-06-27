import { enableTailwind } from '@remotion/tailwind'
import path from 'path'
import { Config } from 'remotion'

Config.setPublicDir('./public')
Config.setEntryPoint('./src/index.ts')
Config.setOutputLocation('../../output/output.mp4')
Config.setDotEnvLocation('../../.env')

Config.setShouldOpenBrowser(false)
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
