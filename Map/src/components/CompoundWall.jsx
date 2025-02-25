import React from 'react'

const CompoundWall = () => {
  // Wall dimensions
  const wallThickness = 1
  const wallHeight = 3
  const campusWidth = 120  // Keeping width same
  const campusDepth = 140  // Increased depth to include sports building

  return (
    <group>
      {/* North Wall */}
      <mesh position={[0, wallHeight/2, campusDepth/2]}>
        <boxGeometry args={[campusWidth, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#8B7355" roughness={0.9} />
      </mesh>

      {/* South Wall - Moved further south */}
      <mesh position={[0, wallHeight/2, -campusDepth/2]}>
        <boxGeometry args={[campusWidth, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#8B7355" roughness={0.9} />
      </mesh>

      {/* East Wall - Made longer */}
      <mesh position={[campusWidth/2, wallHeight/2, 0]}>
        <boxGeometry args={[wallThickness, wallHeight, campusDepth]} />
        <meshStandardMaterial color="#8B7355" roughness={0.9} />
      </mesh>

      {/* West Wall - Made longer */}
      <mesh position={[-campusWidth/2, wallHeight/2, 0]}>
        <boxGeometry args={[wallThickness, wallHeight, campusDepth]} />
        <meshStandardMaterial color="#8B7355" roughness={0.9} />
      </mesh>

      {/* Wall pillars at corners */}
      {[
        [campusWidth/2, 0, campusDepth/2],
        [campusWidth/2, 0, -campusDepth/2],
        [-campusWidth/2, 0, campusDepth/2],
        [-campusWidth/2, 0, -campusDepth/2]
      ].map((position, index) => (
        <mesh key={index} position={[position[0], wallHeight/2, position[2]]}>
          <boxGeometry args={[wallThickness * 2, wallHeight * 1.2, wallThickness * 2]} />
          <meshStandardMaterial color="#6B4423" roughness={0.8} />
        </mesh>
      ))}

      {/* Main gate */}
      <group position={[0, wallHeight/2, campusDepth/2]}>
        {/* Gate pillars */}
        <mesh position={[-4, 0, 0]}>
          <boxGeometry args={[wallThickness * 2, wallHeight * 1.2, wallThickness * 2]} />
          <meshStandardMaterial color="#6B4423" roughness={0.8} />
        </mesh>
        <mesh position={[4, 0, 0]}>
          <boxGeometry args={[wallThickness * 2, wallHeight * 1.2, wallThickness * 2]} />
          <meshStandardMaterial color="#6B4423" roughness={0.8} />
        </mesh>
        {/* Gate arch */}
        <mesh position={[0, wallHeight/4, 0]}>
          <boxGeometry args={[8, wallHeight * 1.5, wallThickness]} />
          <meshStandardMaterial color="#8B7355" roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}

export default CompoundWall
