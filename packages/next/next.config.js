const path = require('path')

require('dotenv').config({
  path: path.join(process.cwd(), '../../.env'),
})

if (!process.env.PORT_EXPRESS) {
  throw new Error('PORT_EXPRESS is not defined')
}
if (!process.env.PORT_REMOTION) {
  throw new Error('PORT_REMOTION is not defined')
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.tsx?$/,
      use: 'ts-loader',
      include: [path.join(process.cwd(), '../global')],
      exclude: /node_modules/,
    })
    return config
  },
  env: {
    PORT_EXPRESS: process.env.PORT_EXPRESS,
    PORT_REMOTION: process.env.PORT_REMOTION,
  },
}

module.exports = nextConfig
