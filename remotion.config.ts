import { Config } from 'remotion'
import { enableTailwind } from '@remotion/tailwind'
import path from 'path'

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
    },
  }
})
