import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict Mode double-mounts components in dev, which kills R3F's WebGL
  // context on the constellation 3D scene ("THREE.WebGLRenderer: Context
  // Lost." on every page load). Production builds never double-mount, so
  // this is purely a dev fix — re-enable when R3F ships a context-recovery
  // path in a future release.
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
