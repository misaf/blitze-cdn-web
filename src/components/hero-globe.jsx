'use client'

/*
 * Mount gate for the hero's WebGL globe.
 *
 * Everything three.js-shaped lives behind this `ssr: false` boundary: the
 * landing page is a Server Component in a static export, and a canvas has
 * nothing to prerender. The scene chunk is only fetched once we know the
 * browser can actually draw it.
 */

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const HeroGlobeScene = dynamic(() => import('./hero-globe-scene'), {
  ssr: false
})

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      canvas.getContext('webgl2') || canvas.getContext('webgl')
    )
  } catch {
    /* Some hardened/privacy configurations throw rather than return null. */
    return false
  }
}

export default function HeroGlobe() {
  /* `null` means "not decided yet" — we render nothing on the first client
     pass so the CSS `hero-art` panel underneath is what the user sees until
     the scene is genuinely ready. */
  const [enabled, setEnabled] = useState(null)
  const [animate, setAnimate] = useState(true)

  useEffect(() => {
    if (!supportsWebGL()) {
      setEnabled(false)
      return
    }

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setAnimate(!motion.matches)

    sync()
    setEnabled(true)
    motion.addEventListener('change', sync)
    return () => motion.removeEventListener('change', sync)
  }, [])

  if (!enabled) return null

  return (
    <div className="absolute inset-0 motion-safe:animate-[hero-globe-in_900ms_ease-out_both]">
      <HeroGlobeScene animate={animate} />
    </div>
  )
}
