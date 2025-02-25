import React, { useRef } from 'react'
import { Plane } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import useStore from '../store'

const Road = () => {
  const { path, isNavigating } = useStore()
  const pathRef = useRef()

  // Animate the path
  useFrame(({ clock }) => {
    if (pathRef.current && isNavigating) {
      pathRef.current.material.opacity = 0.6 + Math.sin(clock.getElapsedTime() * 2) * 0.4
    }
  })

  return (
    <group>
      {/* Main vertical road */}
      <Plane
        args={[6, 100]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, -10]}
      >
        <meshPhysicalMaterial 
          color="#333333" 
          metalness={0.6}
          roughness={0.4}
          clearcoat={0.5}
          clearcoatRoughness={0.4}
        />
      </Plane>

      {/* Main horizontal roads */}
      <Plane
        args={[80, 6]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 20]}
      >
        <meshPhysicalMaterial 
          color="#333333" 
          metalness={0.6}
          roughness={0.4}
          clearcoat={0.5}
          clearcoatRoughness={0.4}
        />
      </Plane>
      <Plane
        args={[80, 6]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, -40]}
      >
        <meshPhysicalMaterial 
          color="#333333" 
          metalness={0.6}
          roughness={0.4}
          clearcoat={0.5}
          clearcoatRoughness={0.4}
        />
      </Plane>

      {/* Building connection roads */}
      <Plane
        args={[6, 30]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-35, 0.01, -30]}
      >
        <meshPhysicalMaterial 
          color="#333333" 
          metalness={0.6}
          roughness={0.4}
          clearcoat={0.5}
          clearcoatRoughness={0.4}
        />
      </Plane>
      <Plane
        args={[6, 30]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[35, 0.01, -30]}
      >
        <meshPhysicalMaterial 
          color="#333333" 
          metalness={0.6}
          roughness={0.4}
          clearcoat={0.5}
          clearcoatRoughness={0.4}
        />
      </Plane>

      {/* Navigation path visualization */}
      {isNavigating && path.map((point, index) => {
        if (index < path.length - 1) {
          const nextPoint = path[index + 1]
          const dx = nextPoint[0] - point[0]
          const dz = nextPoint[2] - point[2]
          const length = Math.sqrt(dx * dx + dz * dz)
          const angle = Math.atan2(dz, dx)
          
          // Calculate midpoint for path segment
          const midX = (point[0] + nextPoint[0]) / 2
          const midZ = (point[2] + nextPoint[2]) / 2
          
          return (
            <group key={index}>
              {/* Path segment */}
              <mesh 
                position={[midX, 0.1, midZ]}
                rotation={[0, angle, 0]}
                ref={index === 0 ? pathRef : undefined}
              >
                <boxGeometry args={[length, 0.1, 1]} />
                <meshPhysicalMaterial
                  color="#4169E1"
                  transparent
                  opacity={0.8}
                  emissive="#4169E1"
                  emissiveIntensity={0.5}
                />
              </mesh>

              {/* Path point marker */}
              <mesh position={[point[0], 0.2, point[2]]}>
                <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
                <meshPhysicalMaterial
                  color="#4169E1"
                  emissive="#4169E1"
                  emissiveIntensity={1}
                />
              </mesh>
            </group>
          )
        }
        
        // Add marker for the last point
        if (index === path.length - 1) {
          return (
            <mesh 
              key="last-point"
              position={[point[0], 0.2, point[2]]}
            >
              <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
              <meshPhysicalMaterial
                color="#4169E1"
                emissive="#4169E1"
                emissiveIntensity={1}
              />
            </mesh>
          )
        }
        
        return null
      })}
    </group>
  )
}

export default Road