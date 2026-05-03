"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"

const nodePositions = [
  [-6.8, -1.8, -2.2],
  [-5.3, 1.9, -1.2],
  [-3.8, -0.4, 0.8],
  [-2.2, 2.5, -2.5],
  [-0.9, -1.9, 1.6],
  [0.7, 1.0, -0.2],
  [2.3, -2.4, -1.7],
  [3.7, 0.6, 1.5],
  [5.2, 2.1, -0.9],
  [6.7, -0.8, 0.5],
] as const

function DataCells() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const cells = useMemo(() => {
    const positions: Array<[number, number, number, number]> = []

    for (let x = -7; x <= 7; x += 2) {
      for (let y = -3; y <= 3; y += 1.5) {
        const z = Math.sin(x * 1.17 + y * 0.8) * 0.9 - 2.4
        const scale = 0.08 + ((x + 7 + y + 3) % 3) * 0.018
        positions.push([x, y, z, scale])
      }
    }

    return positions
  }, [])

  useEffect(() => {
    if (!meshRef.current) return

    cells.forEach(([x, y, z, scale], index) => {
      dummy.position.set(x, y, z)
      dummy.rotation.set(y * 0.22, x * 0.13, (x + y) * 0.08)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      meshRef.current?.setMatrixAt(index, dummy.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  }, [cells, dummy])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.18) * 0.08
    meshRef.current.rotation.x = Math.cos(clock.elapsedTime * 0.14) * 0.05
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, cells.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#22d3ee" roughness={0.15} metalness={0.7} transparent opacity={0.42} />
    </instancedMesh>
  )
}

function RoutingLines() {
  const groupRef = useRef<THREE.Group>(null)
  const geometry = useMemo(() => {
    const segments: number[] = []

    for (let index = 0; index < nodePositions.length - 1; index += 1) {
      segments.push(...nodePositions[index], ...nodePositions[index + 1])
    }

    segments.push(...nodePositions[1], ...nodePositions[5])
    segments.push(...nodePositions[3], ...nodePositions[7])
    segments.push(...nodePositions[4], ...nodePositions[8])

    const routeGeometry = new THREE.BufferGeometry()
    routeGeometry.setAttribute("position", new THREE.Float32BufferAttribute(segments, 3))

    return routeGeometry
  }, [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = clock.elapsedTime * 0.045
    groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.18
  })

  return (
    <group ref={groupRef}>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color="#00A98B" transparent opacity={0.42} />
      </lineSegments>
      {nodePositions.map(([x, y, z], index) => (
        <mesh key={`${x}-${y}-${z}`} position={[x, y, z]} rotation={[0.8, 0.4, 0.2]}>
          <octahedronGeometry args={[index % 3 === 0 ? 0.18 : 0.13, 0]} />
          <meshStandardMaterial color={index % 3 === 0 ? "#f97316" : "#22d3ee"} roughness={0.28} metalness={0.24} emissive={index % 3 === 0 ? "#9a3412" : "#0891b2"} emissiveIntensity={0.16} />
        </mesh>
      ))}
    </group>
  )
}

function ClassifierCore() {
  const coreRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (coreRef.current) {
      coreRef.current.rotation.x = clock.elapsedTime * 0.18
      coreRef.current.rotation.y = clock.elapsedTime * 0.32
    }

    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2.4
      ringRef.current.rotation.z = clock.elapsedTime * -0.22
    }
  })

  return (
    <group position={[2.8, 0.15, -0.6]}>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.35, 1]} />
        <meshStandardMaterial color="#22d3ee" wireframe transparent opacity={0.46} />
      </mesh>
      <mesh ref={ringRef}>
        <torusGeometry args={[2.05, 0.012, 6, 120]} />
        <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.22} />
      </mesh>
      <mesh rotation={[0.4, 0.2, -0.5]}>
        <torusGeometry args={[1.62, 0.01, 6, 120]} />
        <meshStandardMaterial color="#f97316" transparent opacity={0.58} />
      </mesh>
    </group>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 4, 5]} intensity={1.8} />
      <pointLight position={[-5, -2, 3]} intensity={2.2} color="#22d3ee" />
      <group rotation={[0.02, -0.16, 0]}>
        <DataCells />
        <RoutingLines />
        <ClassifierCore />
      </group>
    </>
  )
}

export default function CivicScientificScene() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReducedMotion(query.matches)

    update()
    query.addEventListener("change", update)

    return () => query.removeEventListener("change", update)
  }, [])

  if (reducedMotion) return null

  return (
    <div className="civic-3d-scene pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 8.5], fov: 46 }}
        dpr={[1, 1.35]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
