import React, { useState } from 'react'
import { Html } from '@react-three/drei'

const BusStop = ({ position, stopId }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <group
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Bus stop pole */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
        <meshStandardMaterial color="#666666" />
      </mesh>

      {/* Bus stop sign */}
      <mesh position={[0, 3.5, 0]}>
        <boxGeometry args={[1.2, 0.8, 0.1]} />
        <meshStandardMaterial color="#4169E1" />
      </mesh>

      {/* Bus icon */}
      <mesh position={[0, 3.5, 0.1]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      {/* Information popup when hovered */}
      {hovered && (
        <Html position={[0, 4.5, 0]}>
          <div style={{
            background: 'white',
            padding: '8px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            width: '120px',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: 'bold' }}>Bus Stop {stopId}</div>
          </div>
        </Html>
      )}
    </group>
  )
}

export default BusStop
