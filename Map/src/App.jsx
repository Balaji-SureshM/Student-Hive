import React from 'react'
import { OrbitControls, Environment } from '@react-three/drei'
import Building from './components/Building'
import Road from './components/Road'
import BusStop from './components/BusStop'
import CompoundWall from './components/CompoundWall'
import Tree from './components/Tree'
import VoiceNavigation from './components/VoiceNavigation'

// Bus stop positions - moved further away from buildings
const busStops = {
  stop1: [50, 0, 25],    // Far corner near Arts
  stop2: [-50, 0, 25],   // Far corner near Cafeteria
  stop3: [-50, 0, -45],  // Far corner near Science
  stop4: [50, 0, -45]    // Far corner near Engineering
}

// Tree positions around the campus
const treePositions = [
  // Front entrance trees
  [-10, 0, 65], [10, 0, 65],
  [-20, 0, 65], [20, 0, 65],
  
  // Corner trees
  [-55, 0, 65], [55, 0, 65],     // Front corners
  [-55, 0, -65], [55, 0, -65],   // Back corners
  
  // Side trees - spaced along the walls
  [-55, 0, 40], [-55, 0, 0], [-55, 0, -40],  // Left wall
  [55, 0, 40], [55, 0, 0], [55, 0, -40],     // Right wall
  
  // Back trees near sports area
  [-30, 0, -65], [0, 0, -65], [30, 0, -65],
  
  // Interior trees near buildings
  [-30, 0, 30], [30, 0, 30],     // Near front buildings
  [-30, 0, -30], [30, 0, -30],   // Near middle buildings
  [-30, 0, -50], [30, 0, -50],   // Near sports area
  
  // Additional trees for sports area
  [-20, 0, -55], [20, 0, -55],
  [-40, 0, -55], [40, 0, -55]
]

function App() {
  return (
    <>
      <OrbitControls 
        enableDamping 
        dampingFactor={0.05} 
        maxDistance={500} 
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
      />
      <Environment preset="sunset" background blur={0.8} />
      <fog attach="fog" args={['#f0f0f0', 0.0008, 500]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[50, 50, 25]}
        intensity={2}
      />
      <CompoundWall />
      <Building />
      <Road />
      {/* Add bus stops */}
      {Object.entries(busStops).map(([stopId, position]) => (
        <BusStop key={stopId} stopId={stopId} position={position} />
      ))}
      {/* Add trees */}
      {treePositions.map((position, index) => (
        <Tree 
          key={index} 
          position={position} 
          scale={0.8 + Math.random() * 0.4} // Random size variation
        />
      ))}
      <VoiceNavigation />
    </>
  )
}

export default App