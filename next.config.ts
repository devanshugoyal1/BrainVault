import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // ❌ Remove this block entirely:
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
}

export default nextConfig