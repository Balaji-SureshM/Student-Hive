import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import useStore from '../store'

// Bus route data
const busRoutes = {
  'stop1': {
    name: 'Main Campus Loop',
    stops: ['stop1', 'stop2', 'stop3', 'stop4'],
    color: '#FF4444',
    path: [
      [45, 0, 20],    // Arts area
      [35, 0, 20],    // Near Arts
      [0, 0, 20],     // Student Center
      [-35, 0, 20],   // Near Cafeteria
      [-35, 0, -15],  // Near Library
      [-35, 0, -40],  // Near Science
      [0, 0, -40],    // Main road
      [35, 0, -40],   // Near Engineering
      [35, 0, -15],   // Near Admin
      [35, 0, 20],    // Back to Arts
      [45, 0, 20]     // Complete loop
    ]
  },
  'stop2': {
    name: 'East Campus Express',
    stops: ['stop2', 'stop4'],
    color: '#44FF44',
    path: [
      [-45, 0, 20],   // Cafeteria area
      [-35, 0, 20],   // Near Cafeteria
      [-35, 0, -40],  // Near Science
      [0, 0, -40],    // Main road
      [35, 0, -40],   // Near Engineering
      [35, 0, -15],   // Complete route
      [-45, 0, 20]    // Back to start
    ]
  }
}

const BusRoute = () => {
  const { showBusRoute, currentBusStop } = useStore()
  const pathRef = useRef()

  // Animate the path
  useFrame(({ clock }) => {
    if (pathRef.current && showBusRoute) {
      pathRef.current.material.opacity = 0.6 + Math.sin(clock.getElapsedTime() * 2) * 0.4
    }
  })

  if (!showBusRoute || !currentBusStop || !busRoutes[currentBusStop]) return null

  const route = busRoutes[currentBusStop]

  return (
    <group>
      {/* Route path */}
      {route.path.map((point, index) => {
        if (index < route.path.length - 1) {
          const nextPoint = route.path[index + 1]
          const dx = nextPoint[0] - point[0]
          const dz = nextPoint[2] - point[2]
          const length = Math.sqrt(dx * dx + dz * dz)
          const angle = Math.atan2(dz, dx)
          
          const midX = (point[0] + nextPoint[0]) / 2
          const midZ = (point[2] + nextPoint[2]) / 2
          
          return (
            <group key={index}>
              {/* Route segment */}
              <mesh 
                position={[midX, 0.15, midZ]}
                rotation={[0, angle, 0]}
                ref={index === 0 ? pathRef : undefined}
              >
                <boxGeometry args={[length, 0.1, 0.8]} />
                <meshPhysicalMaterial
                  color={route.color}
                  transparent
                  opacity={0.8}
                  emissive={route.color}
                  emissiveIntensity={0.5}
                />
              </mesh>

              {/* Stop marker */}
              {route.stops.includes(`stop${index + 1}`) && (
                <mesh position={[point[0], 0.3, point[2]]}>
                  <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
                  <meshPhysicalMaterial
                    color={route.color}
                    emissive={route.color}
                    emissiveIntensity={1}
                  />
                </mesh>
              )}
            </group>
          )
        }
        return null
      })}
    </group>
  )
}

export default BusRoute
