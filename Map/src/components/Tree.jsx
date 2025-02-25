import React from 'react'

const Tree = ({ position, scale = 1 }) => {
  return (
    <group position={position} scale={scale}>
      {/* Tree trunk */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 4, 8]} />
        <meshStandardMaterial color="#4A2F1B" roughness={0.9} />
      </mesh>

      {/* Tree foliage - multiple layers for fuller look */}
      <group position={[0, 5, 0]}>
        {/* Bottom layer */}
        <mesh position={[0, -1, 0]}>
          <coneGeometry args={[2, 3, 8]} />
          <meshStandardMaterial color="#228B22" roughness={0.8} />
        </mesh>
        {/* Middle layer */}
        <mesh position={[0, 0, 0]}>
          <coneGeometry args={[1.7, 3, 8]} />
          <meshStandardMaterial color="#308B32" roughness={0.8} />
        </mesh>
        {/* Top layer */}
        <mesh position={[0, 1, 0]}>
          <coneGeometry args={[1.4, 3, 8]} />
          <meshStandardMaterial color="#408B42" roughness={0.8} />
        </mesh>
      </group>
    </group>
  )
}

export default Tree
