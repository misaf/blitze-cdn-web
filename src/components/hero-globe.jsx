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
import { useSyncExternalStore } from 'react'

const HeroGlobeScene = dynamic(() => import('./hero-globe-scene'), {
  ssr: false,
})

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    /* Some hardened/privacy configurations throw rather than return null. */
    return false
  }
}

function prefersLightweightPage() {
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection

  return Boolean(
    connection?.saveData ||
    (connection?.effectiveType &&
      ['slow-2g', '2g'].includes(connection.effectiveType)),
  )
}

export default function HeroGlobe() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  if (!mounted) return null

  return <MountedHeroGlobe />
}

function subscribeToMotionPreference(callback) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}

function getMotionPreference() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function MountedHeroGlobe() {
  const reduceMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    getMotionPreference,
    () => true,
  )

  if (!supportsWebGL() || prefersLightweightPage()) return null

  return (
    <div className="absolute inset-0 motion-safe:animate-[hero-globe-in_900ms_ease-out_both]">
      <HeroGlobeScene animate={!reduceMotion} />
    </div>
  )
}
