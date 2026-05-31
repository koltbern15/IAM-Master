import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The original reason for disabling Strict Mode (R3F WebGL context loss in
  // the abandoned 3D constellation) is gone — that code and the three/@react-three
  // deps were removed. Left off for now as a precaution; re-enabling should be
  // paired with a dev-time double-mount pass over the remaining effects.
  reactStrictMode: false,
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  experimental: {
    mdxRs: false
  }
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: []
  }
})

export default withMDX(nextConfig)
