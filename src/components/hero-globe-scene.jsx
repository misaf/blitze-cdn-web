'use client'

/*
 * The hero's 3D object: the controller at the centre, edge nodes on an
 * orbiting ring, and pulses running the spokes in both directions —
 * configuration outbound, convergence status inbound.
 *
 * This is the product's actual shape rather than a network map: one controller
 * that owns state, N edges that own nothing, and a single channel between
 * them. The two pulse colours are the two halves of the split.
 *
 * Loaded only from `hero-globe.jsx`, which gates it behind `ssr: false` — a
 * WebGL canvas has nothing to prerender, and this is a static export. The CSS
 * `hero-art` panel stays underneath as the fallback, so the hero never looks
 * broken while this chunk loads (or if it never loads at all).
 */

import { Edges, Line } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

/* Straight from `globals.css`. Duplicated as literals because WebGL materials
   cannot read CSS custom properties. `TEAL` is `--color-tok-key`, which is
   what the site already uses for the Python/controller side of the split. */
const ACCENT = '#ffb61f'
const TEAL = '#7fd6c4'
const VIOLET = '#7a2f6b'
const INK = '#0c0e14'

const CORE_RADIUS = 0.34
const RING_RADIUS = 1.5
const NODE_SIZE = 0.15

/*
 * The edges. Eight is enough to read as "a fleet" while leaving the spokes far
 * enough apart not to moiré when the ring turns edge-on.
 *
 * `inbound` flips the spoke's pulse direction: those edges are reporting
 * convergence back rather than receiving a plan. Mixed deliberately, so both
 * directions are always visible somewhere on the ring.
 */
const EDGES = [
  { id: 'edge-1', inbound: false },
  { id: 'edge-2', inbound: true },
  { id: 'edge-3', inbound: false },
  { id: 'edge-4', inbound: false },
  { id: 'edge-5', inbound: true },
  { id: 'edge-6', inbound: false },
  { id: 'edge-7', inbound: true },
  { id: 'edge-8', inbound: false }
].map((edge, index, all) => {
  const angle = (index / all.length) * Math.PI * 2
  return {
    ...edge,
    angle,
    position: new THREE.Vector3(
      Math.cos(angle) * RING_RADIUS,
      0,
      Math.sin(angle) * RING_RADIUS
    ),
    /* Stagger so the ring never pulses in lockstep. */
    offset: (index * 0.41) % 1,
    speed: 0.3 + (index % 3) * 0.06
  }
})

/* Where a spoke leaves the controller: its surface, not its centre, so the
   lines do not visibly cross the core. */
const SPOKE_START = CORE_RADIUS * 1.25

/*
 * The controller. Python owns state, so this is the one thing in the scene
 * that does not orbit anything — it holds the middle and the ring moves
 * around it.
 */
function Controller({ animate }) {
  const mesh = useRef(null)

  useFrame((state, delta) => {
    if (!animate || !mesh.current) return
    /* Slow, and against the ring's direction. Enough to catch the light on the
       octahedron's facets without competing with the pulses for attention. */
    mesh.current.rotation.y -= delta * 0.12
  })

  return (
    <group>
      {/* Faces are translucent so the lit interior shows through them. Opaque
          geometry draws before transparent, so the inner sphere lands first
          and this blends over it without any manual sort order. */}
      <mesh ref={mesh}>
        <octahedronGeometry args={[CORE_RADIUS, 0]} />
        <meshBasicMaterial color={INK} transparent opacity={0.62} />
        <Edges color={ACCENT} lineWidth={1.8} />
      </mesh>

      <mesh scale={0.55}>
        <sphereGeometry args={[CORE_RADIUS, 20, 16]} />
        <meshBasicMaterial color={ACCENT} toneMapped={false} />
      </mesh>
    </group>
  )
}

/* One edge server: a dark box with lit edges, turned to face the controller so
   the ring reads as pointing inward rather than as eight loose cubes. */
function EdgeNode({ position }) {
  const quaternion = useMemo(() => {
    const matrix = new THREE.Matrix4().lookAt(
      position,
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1, 0)
    )
    return new THREE.Quaternion().setFromRotationMatrix(matrix)
  }, [position])

  return (
    <mesh position={position} quaternion={quaternion}>
      <boxGeometry args={[NODE_SIZE, NODE_SIZE, NODE_SIZE]} />
      <meshBasicMaterial color={INK} />
      <Edges color={ACCENT} lineWidth={1.5} />
    </mesh>
  )
}

/* The spokes plus the packet riding each one. */
function Spokes({ animate }) {
  const spokes = useMemo(
    () =>
      EDGES.map(edge => {
        const direction = edge.position.clone().normalize()
        const start = direction.clone().multiplyScalar(SPOKE_START)
        return { ...edge, start, end: edge.position }
      }),
    []
  )

  const packets = useRef([])

  useFrame(({ clock }) => {
    if (!animate) return
    const t = clock.elapsedTime
    spokes.forEach((spoke, index) => {
      const packet = packets.current[index]
      if (!packet) return
      const travel = (spoke.offset + t * spoke.speed) % 1
      /* Inbound edges run the same ramp backwards — one animation, two
         directions, so the timings stay comparable. */
      const progress = spoke.inbound ? 1 - travel : travel
      packet.position.lerpVectors(spoke.start, spoke.end, progress)
      /* Fade in and out at the ends so packets appear to arrive rather than
         snap back to where they started. */
      packet.scale.setScalar(Math.sin(travel * Math.PI) * 0.9 + 0.1)
    })
  })

  return (
    <group>
      {spokes.map((spoke, index) => (
        <group key={spoke.id}>
          <Line
            points={[spoke.start, spoke.end]}
            color={spoke.inbound ? TEAL : ACCENT}
            lineWidth={1.2}
            transparent
            opacity={0.5}
          />
          <mesh ref={element => (packets.current[index] = element)}>
            <sphereGeometry args={[0.032, 12, 12]} />
            <meshBasicMaterial
              color={spoke.inbound ? TEAL : ACCENT}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* The orbit itself, drawn faintly. Without it the nodes read as floating at
   unrelated depths rather than as a ring seen at an angle. */
function Orbit() {
  const points = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, RING_RADIUS, RING_RADIUS)
    return curve
      .getPoints(96)
      .map(point => new THREE.Vector3(point.x, 0, point.y))
  }, [])

  return (
    <Line points={points} color={ACCENT} lineWidth={1} transparent opacity={0.16} />
  )
}

/*
 * The glow behind the controller.
 *
 * A view-angle (fresnel) shell is the usual trick here, but it only reads as a
 * halo when a solid object occludes its middle — the controller is far too
 * small for that, and you just get a flat disc. So this is an explicit radial
 * falloff on a camera-facing plane instead: brightest at the core, gone well
 * before the ring.
 *
 * Additive and depth-write-off, so it never occludes anything in front of it.
 */
function Glow() {
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color(VIOLET) } }),
    []
  )

  return (
    <mesh>
      <planeGeometry args={[2.6, 2.6]} />
      <shaderMaterial
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          varying vec2 vUv;
          void main() {
            float d = length(vUv - 0.5) * 2.0;
            /* Steep exponent: the light has to be gone by the time it reaches
               the ring, or the edge nodes wash out against it. */
            float glow = pow(max(1.0 - d, 0.0), 3.2);
            /* Kept dim on purpose: this sits over the CSS bloom, and the two
               lights stack. Bright enough here reads as magenta on the page. */
            gl_FragColor = vec4(uColor * glow * 1.5, glow);
          }
        `}
      />
    </mesh>
  )
}

function Topology({ animate }) {
  const ring = useRef(null)

  useFrame((state, delta) => {
    if (!animate || !ring.current) return
    ring.current.rotation.y += delta * 0.16
  })

  return (
    <group>
      {/* Outside the tilt as well as the rotation: the plane is untransformed,
          so it squarely faces a camera that sits on the +Z axis. A glow that
          tilts or spins is a glow you can see tilting and spinning. */}
      <Glow />

      {/* Tilted well off edge-on: at a shallower angle the ring collapses
          toward a line and the far nodes overlap the core. */}
      <group rotation={[0.42, 0, 0.12]}>
        <group ref={ring}>
          <Orbit />
          <Spokes animate={animate} />
          {EDGES.map(edge => (
            <EdgeNode key={edge.id} position={edge.position} />
          ))}
        </group>

        <Controller animate={animate} />
      </group>
    </group>
  )
}

/*
 * Dolly the camera so the object is framed the same way at every panel shape.
 * The hero column is a grid track — it goes from roughly square on desktop to
 * short-and-wide on tablets — and a fixed camera distance either crops the
 * ring or strands it in the middle of a lot of empty canvas.
 *
 * `FIT` is the world-space half-extent we insist on seeing. The ring plus a
 * node's half-diagonal reaches about 1.63, so this leaves a real margin.
 */
const FIT = 2.05

function CameraRig() {
  const camera = useThree(state => state.camera)
  const size = useThree(state => state.size)

  useLayoutEffect(() => {
    const aspect = size.width / size.height
    const halfFov = (camera.fov * Math.PI) / 360
    /* Vertical FOV is the constraint only while the panel is at least as wide
       as it is tall; below that, width binds and we pull back further. */
    camera.position.z = FIT / Math.tan(halfFov) / Math.min(1, aspect)
    camera.updateProjectionMatrix()
  }, [camera, size])

  return null
}

export default function HeroGlobeScene({ animate = true }) {
  return (
    <Canvas
      /* `demand` renders one frame and stops — the reduced-motion path pays
         for a single draw and then nothing. The pulses simply park where their
         stagger left them, which reads as a diagram. */
      frameloop={animate ? 'always' : 'demand'}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: 'none' }}
    >
      <CameraRig />
      <Topology animate={animate} />
    </Canvas>
  )
}
