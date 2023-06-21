import { Config } from 'remotion'
import { enableTailwind } from '@remotion/tailwind'
import path from 'path'

Config.setPort(5000)

Config.setPublicDir('./public')
Config.setEntryPoint('./src/remotion/index.ts')
Config.setOutputLocation('./public/remotion/video-cache/output.mp4')

Config.setShouldOpenBrowser(false)
Config.setChromiumHeadlessMode(false)
Config.setChromiumDisableWebSecurity(true)

Config.overrideWebpackConfig((config) => {
  const newConfig = enableTailwind(config)
  return {
    ...newConfig,
    resolve: {
      ...newConfig.resolve,
      alias: {
        ...(newConfig.resolve?.alias ?? {}),
        '@': path.join(process.cwd(), 'src'),
        '@@': path.join(process.cwd(), 'src', 'remotion'),
      },
      fallback: {
        ...(newConfig.resolve?.fallback ?? {}),
        fs: false,
        path: false,
        util: false,
        os: false,
      },
    },
  }
})
