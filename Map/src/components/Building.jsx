import React from 'react'
import { Box, Text, Html } from '@react-three/drei'
import useStore from '../store'

const RoomButton = ({ isOccupied, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '8px 16px',
        backgroundColor: isOccupied ? '#ff6b6b' : '#90EE90',
        color: '#000000',
        border: '2px solid #000000',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        userSelect: 'none',
        pointerEvents: 'auto',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        minWidth: '140px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}
    >
      {isOccupied ? 'Mark as Available' : 'Mark as Occupied'}
    </div>
  )
}

const BuildingBlock = ({ position, size, color, type }) => {
  const height = size[1]
  const displayName = type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  const floors = Math.floor(height / 4) // Assuming each floor is 4 units tall
  const { classroomOccupancy, selectedBuilding, selectedRoom } = useStore()
  const isSelected = selectedBuilding === type || selectedRoom?.startsWith(type)
  const [hoveredRoom, setHoveredRoom] = React.useState(null)
  
  const handleToggleOccupancy = (building, side, index, e) => {
    e.stopPropagation()
    useStore.getState().toggleClassroomOccupancy(building, side, index)
  }

  return (
    <group position={position}>
      {/* Building name */}
      <Text
        position={[0, height + 2, 0]}
        fontSize={3}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        raycast={() => null}
      >
        {displayName}
      </Text>
      {/* Classrooms - Rendering these first so they're behind the building */}
      {[...Array(floors)].map((_, floor) => (
        <React.Fragment key={`floor-${floor}`}>
          {/* Left classroom */}
          <group>
            <Box
              args={[size[0]/2.5, 3, size[2]/2]}
              position={[-size[0]/4, floor * 4 + 2, 0]}
              onClick={(e) => {
                e.stopPropagation()
                const roomId = `${type}-${floor + 1}-L`
                useStore.setState({ selectedRoom: roomId })
              }}
              onPointerEnter={(e) => {
                e.stopPropagation()
                setHoveredRoom(`${type}-${floor + 1}-L`)
              }}
              onPointerLeave={(e) => {
                e.stopPropagation()
                setHoveredRoom(null)
              }}
            >
              <meshPhysicalMaterial
                color={classroomOccupancy[type]?.left[floor] ? '#ff6b6b' : '#90EE90'}
                metalness={0.1}
                roughness={0.2}
                transmission={0.3}
                thickness={0.5}
                transparent={true}
                opacity={0.8}
              />
            </Box>
          </group>
          {/* Right classroom */}
          <group>
            <Box
              args={[size[0]/2.5, 3, size[2]/2]}
              position={[size[0]/4, floor * 4 + 2, 0]}
              onClick={(e) => {
                e.stopPropagation()
                const roomId = `${type}-${floor + 1}-R`
                useStore.setState({ selectedRoom: roomId })
              }}
              onPointerEnter={(e) => {
                e.stopPropagation()
                setHoveredRoom(`${type}-${floor + 1}-R`)
              }}
              onPointerLeave={(e) => {
                e.stopPropagation()
                setHoveredRoom(null)
              }}
            >
              <meshPhysicalMaterial
                color={classroomOccupancy[type]?.right[floor] ? '#ff6b6b' : '#90EE90'}
                metalness={0.1}
                roughness={0.2}
                transmission={0.3}
                thickness={0.5}
                transparent={true}
                opacity={0.8}
              />
            </Box>
          </group>
        </React.Fragment>
      ))}

      {/* Building structure - with raycast disabled */}
      <Box 
        args={size} 
        position={[0, height/2, 0]} 
        raycast={() => null}
      >
        <meshPhysicalMaterial 
          color={color} 
          metalness={0.2} 
          roughness={0.8}
          envMapIntensity={1}
          transmission={0.5}
          thickness={0.5}
          transparent={true}
          opacity={0.3}
          depthWrite={false}
        />
      </Box>
      
      {/* Entrance - with raycast disabled */}
      <Box 
        args={[size[0]/3, size[1]/3, 1]} 
        position={[0, size[1]/6, size[2]/2 + 0.5]}
        raycast={() => null}
      >
        <meshPhysicalMaterial 
          color="#d0d0d0" 
          metalness={0.3} 
          roughness={0.7}
          clearcoat={0.5}
          transparent={true}
          opacity={0.7}
        />
      </Box>

      {/* Room Info Panels - Rendering these last so they're always on top */}
      {[...Array(floors)].map((_, floor) => (
        <React.Fragment key={`floor-info-${floor}`}>
          {/* Left room info */}
          {(selectedRoom === `${type}-${floor + 1}-L` || hoveredRoom === `${type}-${floor + 1}-L`) && (
            <group position={[-size[0]/4, floor * 4 + 2, size[2]/2 + 2]}>
              <Box args={[6, 3, 0.1]} position={[0, 0, 0.05]} raycast={() => null}>
                <meshBasicMaterial color="#ffffff" opacity={0.95} transparent depthWrite={false} />
              </Box>
              <Text
                position={[0, 0.5, 0.1]}
                fontSize={0.8}
                color="#000000"
                anchorX="center"
                anchorY="middle"
                maxWidth={5}
                raycast={() => null}
              >
                {`Room ${type}-${floor + 1}-L`}
              </Text>
              <Html 
                position={[0, -0.5, 0.2]} 
                transform 
                occlude={false} 
                style={{ 
                  pointerEvents: 'auto', 
                  zIndex: 100,
                  transform: 'scale(1.2)',
                  cursor: 'pointer'
                }}
                raycast={() => null}
              >
                <RoomButton 
                  isOccupied={classroomOccupancy[type]?.left[floor]} 
                  onClick={(e) => handleToggleOccupancy(type, 'left', floor, e)}
                />
              </Html>
            </group>
          )}
          {/* Right room info */}
          {(selectedRoom === `${type}-${floor + 1}-R` || hoveredRoom === `${type}-${floor + 1}-R`) && (
            <group position={[size[0]/4, floor * 4 + 2, size[2]/2 + 2]}>
              <Box args={[6, 3, 0.1]} position={[0, 0, 0.05]} raycast={() => null}>
                <meshBasicMaterial color="#ffffff" opacity={0.95} transparent depthWrite={false} />
              </Box>
              <Text
                position={[0, 0.5, 0.1]}
                fontSize={0.8}
                color="#000000"
                anchorX="center"
                anchorY="middle"
                maxWidth={5}
                raycast={() => null}
              >
                {`Room ${type}-${floor + 1}-R`}
              </Text>
              <Html 
                position={[0, -0.5, 0.2]} 
                transform 
                occlude={false} 
                style={{ 
                  pointerEvents: 'auto', 
                  zIndex: 100,
                  transform: 'scale(1.2)',
                  cursor: 'pointer'
                }}
                raycast={() => null}
              >
                <RoomButton 
                  isOccupied={classroomOccupancy[type]?.right[floor]} 
                  onClick={(e) => handleToggleOccupancy(type, 'right', floor, e)}
                />
              </Html>
            </group>
          )}
        </React.Fragment>
      ))}
    </group>
  )
}

const MainGate = () => (
  <group position={[0, 0, 40]}>
    {/* Gate pillars */}
    <Box args={[2, 8, 2]} position={[-6, 4, 0]}>
      <meshPhysicalMaterial 
        color="#d0d0d0" 
        metalness={0.4} 
        roughness={0.6}
        clearcoat={0.3}
      />
    </Box>
    <Box args={[2, 8, 2]} position={[6, 4, 0]}>
      <meshPhysicalMaterial 
        color="#d0d0d0" 
        metalness={0.4} 
        roughness={0.6}
        clearcoat={0.3}
      />
    </Box>
    {/* Gate top */}
    <Box args={[14, 2, 2]} position={[0, 7, 0]}>
      <meshPhysicalMaterial 
        color="#c0c0c0" 
        metalness={0.5} 
        roughness={0.5}
        clearcoat={0.4}
      />
    </Box>
  </group>
)

const BusStop = ({ position, routes }) => (
  <group position={position}>
    {/* Bus shelter base */}
    <Box args={[4, 0.1, 2]} position={[0, 0, 0]}>
      <meshPhysicalMaterial color="#a0a0a0" metalness={0.4} roughness={0.6} />
    </Box>
    {/* Back wall */}
    <Box args={[4, 2.5, 0.1]} position={[0, 1.25, -1]}>
      <meshPhysicalMaterial color="#d0d0d0" metalness={0.3} roughness={0.7} transparent={true} opacity={0.6} />
    </Box>
    {/* Roof */}
    <Box args={[4.2, 0.1, 2.2]} position={[0, 2.5, 0]}>
      <meshPhysicalMaterial color="#808080" metalness={0.5} roughness={0.5} />
    </Box>
    {/* Route display */}
    <Text
      position={[0, 1.8, -0.9]}
      fontSize={0.3}
      color="#000000"
      anchorX="center"
      anchorY="middle"
      maxWidth={3}
      raycast={() => null}
    >
      {`Bus Routes:\n${routes.join(', ')}`}
    </Text>
  </group>
)

const Building = () => {
  return (
    <group>
      {/* Green Base */}
      <Box args={[150, 0.1, 150]} position={[0, -0.05, 0]}>
        <meshPhysicalMaterial 
          color="#90EE90" 
          metalness={0.1} 
          roughness={0.9}
          clearcoat={0.2}
        />
      </Box>

      {/* Main Academic Building */}
      <BuildingBlock 
        position={[0, 0, -10]} 
        size={[15, 20, 12]} 
        color="#f0f0f0"
        type="academic"
      />

      {/* Library */}
      <BuildingBlock 
        position={[-35, 0, -15]} 
        size={[20, 15, 15]} 
        color="#e8e8e8"
        type="library"
      />

      {/* Administration Block */}
      <BuildingBlock 
        position={[35, 0, -15]} 
        size={[18, 12, 12]} 
        color="#f5f5f5"
        type="admin"
      />

      {/* Sports Complex */}
      <BuildingBlock 
        position={[0, 0, -60]} 
        size={[25, 10, 20]} 
        color="#e0e0e0"
        type="sports"
      />

      {/* Cafeteria */}
      <BuildingBlock 
        position={[-35, 0, 20]} 
        size={[12, 8, 12]} 
        color="#f8f8f8"
        type="cafeteria"
      />

      {/* Science Building */}
      <BuildingBlock 
        position={[-35, 0, -40]} 
        size={[22, 18, 15]} 
        color="#e6e6fa"
        type="science"
      />

      {/* Engineering Building */}
      <BuildingBlock 
        position={[35, 0, -40]} 
        size={[25, 16, 18]} 
        color="#f0e68c"
        type="engineering"
      />

      {/* Arts Building */}
      <BuildingBlock 
        position={[40, 0, 20]} 
        size={[16, 14, 14]} 
        color="#ffdab9"
        type="arts"
      />

      {/* Student Center */}
      <BuildingBlock 
        position={[0, 0, 20]} 
        size={[18, 12, 15]} 
        color="#dda0dd"
        type="student_center"
      />

      {/* Main Gate */}
      <MainGate />

      {/* Bus Stops */}
      <BusStop position={[-20, 0, 35]} routes={['Route 1: Main Gate - Academic', 'Route 3: Campus Loop']} />
      <BusStop position={[20, 0, 35]} routes={['Route 2: Library - Sports Complex', 'Route 3: Campus Loop']} />
      <BusStop position={[-45, 0, -15]} routes={['Route 2: Library - Sports Complex', 'Route 4: Science Express']} />
      <BusStop position={[45, 0, -15]} routes={['Route 1: Main Gate - Academic', 'Route 4: Science Express']} />
      <BusStop position={[0, 0, -50]} routes={['Route 2: Library - Sports Complex', 'Route 3: Campus Loop']} />
    </group>
  )
}

export default Building