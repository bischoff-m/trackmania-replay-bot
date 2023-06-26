const path = require('path')

require('dotenv').config({
  path: path.join(process.cwd(), '../../.env'),
})

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
    PORT_EXPRESS: process.env.PORT_EXPRESS ?? '4000',
    PORT_REMOTION: process.env.PORT_REMOTION ?? '5000',
  },
}

module.exports = nextConfig
