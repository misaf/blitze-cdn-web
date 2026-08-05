'use client'

/*
 * The hero's 3D object: the path a request actually takes.
 *
 *   client → anycast → nearest edge → origin, and the response back again
 *
 * This is the data plane, not the control plane the rest of the page
 * describes. The routing decision is the point of the scene: a packet arrives
 * at a single anycast address and is handed to whichever edge is nearest,
 * which is why "nearest" here is literal — each client's route is resolved by
 * comparing actual distances to the edge nodes, not hand-assigned. Move a
 * client and its route follows.
 *
 * Loaded only from `hero-globe.jsx`, which gates it behind `ssr: false` — a
 * WebGL canvas has nothing to prerender, and this is a static export. The CSS
 * `hero-art` panel stays underneath as the fallback, so the hero never looks
 * broken while this chunk loads (or if it never loads at all).
 */

import { Edges, Html, Line } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

/* Straight from `globals.css`. Duplicated as literals because WebGL materials
   cannot read CSS custom properties. `TEAL` is `--color-tok-key`, used here
   for the response leg so the two directions never read as one stream. */
const ACCENT = '#ffb61f'
const TEAL = '#7fd6c4'
const INK = '#0c0e14'
/* The hero gradient's mid stop. It reads as "stopped" against the amber
   without introducing a red the palette does not otherwise contain — and
   hostile packets are told apart by shape as much as by colour, so this does
   not have to carry the distinction alone. */
const EMBER = '#f0761d'

/* Stations along the path. */
const CLIENT_X = -1.95
const ANYCAST_X = -0.75
const EDGE_X = 0.4
const ORIGIN_X = 1.85

const ANYCAST_HEIGHT = 1.9
const ANYCAST_DEPTH = 0.9
const NODE_SIZE = 0.17

/* The edge fleet. Spread in depth as well as height so the fan-out occupies
   space rather than reading as a flat list. */
const EDGES = [
  { id: 'edge-a', y: 0.86, z: -0.24 },
  { id: 'edge-b', y: 0.29, z: 0.26 },
  { id: 'edge-c', y: -0.29, z: -0.14 },
  { id: 'edge-d', y: -0.86, z: 0.3 },
].map((edge) => ({
  ...edge,
  position: new THREE.Vector3(EDGE_X, edge.y, edge.z),
}))

/* Where requests enter. Two of these sit between edges rather than level with
   one, so the "nearest" choice is visibly a decision and not a straight line
   through. */
const CLIENTS = [
  { id: 'client-a', y: 0.95, z: -0.18 },
  { id: 'client-b', y: 0.12, z: 0.22 },
  { id: 'client-c', y: -0.52, z: -0.26 },
  { id: 'client-d', y: -1.0, z: 0.16 },
]

const ORIGIN = new THREE.Vector3(ORIGIN_X, 0, 0)

/*
 * Resolve each client to its nearest edge, and build the polyline it follows.
 *
 * The anycast waypoint keeps the client's own height: a packet reaches the
 * anycast address travelling straight, and only changes direction once the
 * routing decision has been made. Bending it early would draw a network that
 * already knew the answer.
 */
const ROUTES = CLIENTS.map((client) => {
  const entry = new THREE.Vector3(CLIENT_X, client.y, client.z)
  const anycast = new THREE.Vector3(ANYCAST_X, client.y, client.z)

  const nearest = EDGES.reduce((best, edge) =>
    anycast.distanceTo(edge.position) < anycast.distanceTo(best.position)
      ? edge
      : best,
  )

  return {
    id: client.id,
    edgeId: nearest.id,
    points: [entry, anycast, nearest.position, ORIGIN],
  }
})

/* Precomputed segment lengths, so a packet moves at a constant speed along the
   whole route instead of accelerating through the short legs. */
const ROUTE_GEOMETRY = ROUTES.map((route) => {
  const lengths = route.points
    .slice(0, -1)
    .map((point, index) => point.distanceTo(route.points[index + 1]))
  const total = lengths.reduce((sum, length) => sum + length, 0)
  return {
    ...route,
    lengths,
    total,
    /* How far along the route the edge sits. Hostile traffic never gets past
       this point, so it is where the block has to happen. */
    edgeAt: (lengths[0] + lengths[1]) / total,
  }
})

/*
 * The traffic. Several requests in flight at once on staggered timers, because
 * a CDN serving one request at a time would be a strange thing to advertise.
 *
 * `hostile` traffic is stopped at the edge and never reaches the origin —
 * which is the claim being made, so it has to be visible without being the
 * dominant story. Two in eight: frequent enough that a visitor sees a block
 * within a few seconds, rare enough that the scene still reads as a network
 * serving requests rather than as a firewall demo.
 */
const PACKETS = [
  { route: 0, offset: 0.0, speed: 0.13, hostile: false },
  { route: 1, offset: 0.28, speed: 0.115, hostile: false },
  { route: 2, offset: 0.52, speed: 0.14, hostile: false },
  { route: 3, offset: 0.74, speed: 0.125, hostile: false },
  { route: 1, offset: 0.63, speed: 0.135, hostile: false },
  { route: 2, offset: 0.17, speed: 0.12, hostile: false },
  { route: 0, offset: 0.44, speed: 0.145, hostile: true },
  { route: 3, offset: 0.09, speed: 0.155, hostile: true },
]

/* Cycle for served traffic: out, brief turnaround at the origin, back, brief
   gap. The turnaround is what makes the return read as a response to that
   request rather than as unrelated traffic heading the other way. */
const OUT_END = 0.44
const BACK_START = 0.5
const BACK_END = 0.94

/* Cycle for hostile traffic: it reaches the edge sooner — it has less distance
   to cover — and then there is nothing but the block. The long dead remainder
   is deliberate. Traffic that gets dropped does not come back. */
const HOSTILE_ARRIVE = 0.34
const HOSTILE_TAIL = 0.62

/* Fraction of the tail spent flaring at the edge before falling away. This is
   the beat that makes the block readable. */
const IMPACT = 0.3

const LABEL_Y = 1.2

const STATIONS = [
  { x: CLIENT_X, text: 'client' },
  { x: ANYCAST_X, text: 'anycast' },
  { x: EDGE_X, text: 'nearest edge' },
  { x: ORIGIN_X, text: 'origin' },
]

function smoothstep(t) {
  return t * t * (3 - 2 * t)
}

/* Position along a polyline by fraction of total length. */
function samplePath(route, t, target) {
  let remaining = THREE.MathUtils.clamp(t, 0, 1) * route.total

  for (let index = 0; index < route.lengths.length; index += 1) {
    const length = route.lengths[index]
    if (remaining <= length || index === route.lengths.length - 1) {
      const f =
        length === 0 ? 0 : THREE.MathUtils.clamp(remaining / length, 0, 1)
      return target.lerpVectors(route.points[index], route.points[index + 1], f)
    }
    remaining -= length
  }

  return target.copy(route.points[route.points.length - 1])
}

/*
 * Station labels.
 *
 * These are what turn the object from geometry into a diagram — without them
 * the scene is legible only to someone who already knows the path.
 *
 * DOM rather than 3D text on purpose: no font asset to ship in a static
 * export, crisp at any DPI, and it inherits the site's own mono face instead
 * of approximating it. `Html` projects through the real camera each frame, so
 * the labels stay pinned to their stations at every panel shape rather than
 * being guessed at with percentages.
 *
 * Above the flow rather than below it, because the CSS bloom underneath is at
 * its hottest along the bottom of the panel — small mono text sat on top of
 * that is unreadable.
 */
function Labels() {
  return (
    <group>
      {STATIONS.map((station) => (
        <Html
          key={station.text}
          position={[station.x, LABEL_Y, 0]}
          center
          style={{
            /* The canvas already ignores pointers; this keeps the labels from
               becoming the one thing in the panel that can be selected. */
            pointerEvents: 'none',
            userSelect: 'none',
            /* The bloom shifts under the labels as the panel resizes, so they
               carry their own contrast rather than relying on what happens to
               be behind them. */
            textShadow: '0 1px 8px rgba(12,14,20,0.95)',
          }}
        >
          <span className="font-mono text-[0.64rem] tracking-[0.12em] whitespace-nowrap text-ink-fg/85">
            {station.text}
          </span>
        </Html>
      ))}
    </group>
  )
}

/*
 * The anycast boundary. One address, many possible destinations — so it is
 * drawn as a single surface every request crosses, rather than as another
 * node. The pane is barely there: a solid one would occlude the crossing,
 * which is the moment worth seeing.
 */
function Anycast({ paneRef }) {
  return (
    <group position={[ANYCAST_X, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <planeGeometry args={[ANYCAST_DEPTH, ANYCAST_HEIGHT]} />
        <meshBasicMaterial
          ref={paneRef}
          color={TEAL}
          transparent
          opacity={0.05}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
        <Edges color={TEAL} lineWidth={1.6} />
      </mesh>
    </group>
  )
}

/* An edge server. Turned to face the incoming traffic so the fleet reads as
   pointing back down the path rather than as loose cubes. */
function EdgeNode({ position }) {
  const quaternion = useMemo(() => {
    const matrix = new THREE.Matrix4().lookAt(
      position,
      new THREE.Vector3(ANYCAST_X, position.y, position.z),
      new THREE.Vector3(0, 1, 0),
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

/* A document at one end of the path: the requesting client, and the origin the
   client asked for. */
function Panel({ x, color }) {
  const rows = useMemo(
    () =>
      /* Ragged lengths, so it reads as content rather than as a barcode. */
      [0.5, 0.34, 0.44, 0.26, 0.4].map((width, index) => ({
        width,
        y: 0.34 - index * 0.17,
      })),
    [],
  )

  return (
    <group position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <planeGeometry args={[0.78, 0.96]} />
        <meshBasicMaterial color={INK} transparent opacity={0.5} />
        <Edges color={color} lineWidth={1.4} />
      </mesh>

      {rows.map((row) => (
        <Line
          key={row.y}
          points={[
            [-row.width / 2, row.y, 0.01],
            [row.width / 2, row.y, 0.01],
          ]}
          color={color}
          lineWidth={2}
          transparent
          opacity={0.35}
        />
      ))}
    </group>
  )
}

/* The routes, drawn faintly. Without them the packets read as drifting in open
   space rather than as following a path something chose for them. */
function Paths() {
  return (
    <group>
      {ROUTE_GEOMETRY.map((route) => (
        <Line
          key={route.id}
          points={route.points}
          color={ACCENT}
          lineWidth={1}
          transparent
          opacity={0.18}
        />
      ))}
    </group>
  )
}

function Traffic({ animate }) {
  const packets = useRef([])
  const pane = useRef(null)
  const lights = useRef({})

  /* Reused every frame so the per-packet work allocates nothing. */
  const cursor = useMemo(() => new THREE.Vector3(), [])
  const scratch = useMemo(() => new THREE.Color(), [])

  const pose = useCallback(
    (time) => {
      let anycastHeat = 0
      const serveHeat = {}
      const blockHeat = {}

      PACKETS.forEach((packet, index) => {
        const mesh = packets.current[index]
        if (!mesh) return

        const route = ROUTE_GEOMETRY[packet.route]
        const cycle = (packet.offset + time * packet.speed) % 1

        let along
        let scale = 0.055
        let colour = ACCENT
        let dropped = 0

        if (packet.hostile) {
          if (cycle <= HOSTILE_ARRIVE) {
            /* Approaching, indistinguishable from anything else in flight —
               nothing about a request announces itself as hostile before it is
               inspected. */
            along = smoothstep(cycle / HOSTILE_ARRIVE) * route.edgeAt
          } else if (cycle <= HOSTILE_TAIL) {
            const tail =
              (cycle - HOSTILE_ARRIVE) / (HOSTILE_TAIL - HOSTILE_ARRIVE)
            along = route.edgeAt
            colour = EMBER

            if (tail < IMPACT) {
              /* Held at the edge and flaring. Without this beat the block is
                 over in a few frames and reads as a packet that simply went
                 missing. */
              const flare = Math.sin((tail / IMPACT) * Math.PI)
              scale = 0.055 * (1 + flare * 0.9)
            } else {
              /* Knocked back off the edge and dropping away. A packet that
                 merely stopped would read as a queue, not a refusal. */
              dropped = (tail - IMPACT) / (1 - IMPACT)
              scale = 0.055 * Math.max(0, 1 - dropped * 1.3)
            }
          } else {
            along = route.edgeAt
            scale = 0
          }
        } else if (cycle <= OUT_END) {
          along = smoothstep(cycle / OUT_END)
        } else if (cycle < BACK_START) {
          /* Held at the origin: the request has arrived and is being served. */
          along = 1
        } else if (cycle <= BACK_END) {
          along = 1 - smoothstep((cycle - BACK_START) / (BACK_END - BACK_START))
          colour = TEAL
        } else {
          along = 0
          scale = 0
        }

        samplePath(route, along, cursor)
        if (dropped > 0) {
          /* Deflected back down the path it came from, and falling. */
          cursor.x -= 0.34 * smoothstep(Math.min(dropped * 2.2, 1))
          cursor.y -= 1.0 * dropped * dropped
        }

        mesh.position.copy(cursor)
        mesh.scale.setScalar(scale)
        mesh.material.color.copy(scratch.set(colour))

        if (scale > 0) {
          /* Narrow bands around the anycast plane and the serving edge, so
             each lights as something actually reaches it. */
          anycastHeat += Math.exp(-(((cursor.x - ANYCAST_X) / 0.14) ** 2))

          const heat = Math.exp(-(((cursor.x - EDGE_X) / 0.16) ** 2))
          const target = packet.hostile ? blockHeat : serveHeat
          target[route.edgeId] = (target[route.edgeId] || 0) + heat
        }
      })

      if (pane.current) {
        pane.current.opacity = 0.05 + Math.min(anycastHeat, 1) * 0.24
      }

      EDGES.forEach((edge) => {
        const light = lights.current[edge.id]
        if (!light) return

        const blocking = Math.min(blockHeat[edge.id] || 0, 1)
        const serving = Math.min(serveHeat[edge.id] || 0, 1)

        /* Blocking wins the colour when both happen at once: an edge dropping
           traffic while serving is the more informative of the two states, and
           a blended teal-ember would read as neither. */
        light.material.color.copy(scratch.set(blocking > 0.05 ? EMBER : TEAL))
        light.scale.setScalar(Math.max(blocking, serving) * 0.075)
      })
    },
    [cursor, scratch],
  )

  useFrame(({ clock }) => {
    if (animate) pose(clock.elapsedTime)
  })

  /* The reduced-motion frame. `frameloop="demand"` draws once, so this has to
     have run before that draw — a layout effect is the last hook to fire
     before the renderer's first pass. Posed where packets sit spread across
     all four stations rather than bunched at one. */
  useLayoutEffect(() => {
    if (!animate) pose(1.7)
  }, [animate, pose])

  return (
    /* Turned off axis so the path is seen in three-quarter rather than
       straight down its length, where the anycast plane would collapse to a
       line and the depth offsets would do nothing. */
    <group rotation={[0.16, -0.52, 0]}>
      <Paths />
      <Labels />

      <Panel x={CLIENT_X} color={TEAL} />
      <Anycast paneRef={pane} />
      <Panel x={ORIGIN_X} color={ACCENT} />

      {EDGES.map((edge) => (
        <group key={edge.id}>
          <EdgeNode position={edge.position} />
          {/* Lights only while it is the one serving. An edge that glowed
              constantly would undo the point of the routing decision. */}
          <mesh
            ref={(element) => (lights.current[edge.id] = element)}
            position={edge.position}
            scale={0}
          >
            <sphereGeometry args={[1, 14, 14]} />
            <meshBasicMaterial color={TEAL} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Hostile traffic is a different shape, not just a different colour.
          Amber and ember are close neighbours on this palette, and at packet
          size a viewer picks up the silhouette long before the hue. */}
      {PACKETS.map((packet, index) => (
        <mesh
          key={`${packet.route}-${packet.offset}`}
          ref={(element) => (packets.current[index] = element)}
        >
          {packet.hostile ? (
            <octahedronGeometry args={[1.5, 0]} />
          ) : (
            <sphereGeometry args={[1, 12, 12]} />
          )}
          <meshBasicMaterial color={ACCENT} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

/*
 * Dolly the camera so the object is framed the same way at every panel shape.
 * The hero column is a grid track — it goes from roughly square on desktop to
 * short-and-wide on tablets — and a fixed camera distance either crops the
 * path or strands it in the middle of a lot of empty canvas.
 *
 * `FIT` is the world-space half-extent we insist on seeing. The three-quarter
 * turn foreshortens the span, so the widest thing on screen is well under the
 * path's full 3.8.
 */
const FIT = 2.15

function CameraRig() {
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)

  useLayoutEffect(() => {
    const aspect = size.width / size.height
    const halfFov = (camera.fov * Math.PI) / 360
    /* Vertical FOV is the constraint only while the panel is at least as wide
       as it is tall; below that, width binds and we pull back further. */
    // React Three Fiber exposes the camera for imperative scene updates.
    // eslint-disable-next-line react-hooks/immutability
    camera.position.z = FIT / Math.tan(halfFov) / Math.min(1, aspect)
    camera.updateProjectionMatrix()
  }, [camera, size])

  return null
}

export default function HeroGlobeScene({ animate = true }) {
  return (
    <Canvas
      /* `demand` renders one frame and stops — the reduced-motion path pays
         for a single draw and then nothing. */
      frameloop={animate ? 'always' : 'demand'}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: 'none' }}
    >
      <CameraRig />
      <Traffic animate={animate} />
    </Canvas>
  )
}
