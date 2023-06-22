const path = require('path')

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
}

module.exports = nextConfig
