/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        config.externals.push({
          'utf-8-validate': 'commonjs utf-8-validate',
          'bufferutil': 'commonjs bufferutil',
        })
        return config
      },
      images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: '**.ipfs.w3s.link',
            
          },
        ],
      },
}

module.exports = nextConfig
