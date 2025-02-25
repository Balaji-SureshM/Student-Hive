// Graph representation of the campus with road intersections
const roadGraph = {
  // Buildings
  academic: { position: [0, 0, -10], connections: ['academic-main'] },
  library: { position: [-35, 0, -15], connections: ['library-main'] },
  admin: { position: [35, 0, -15], connections: ['admin-main'] },
  sports: { position: [0, 0, -60], connections: ['sports-main'] },
  cafeteria: { position: [-35, 0, 20], connections: ['cafeteria-main'] },
  science: { position: [-35, 0, -40], connections: ['science-main'] },
  engineering: { position: [35, 0, -40], connections: ['engineering-main'] },
  arts: { position: [35, 0, 20], connections: ['arts-main'] },
  student_center: { position: [0, 0, 20], connections: ['center-main'] },

  // Building to main road connections
  'academic-main': { position: [0, 0, -10], connections: ['academic', 'main-vertical'] },
  'library-main': { position: [-35, 0, -15], connections: ['library', 'left-vertical'] },
  'admin-main': { position: [35, 0, -15], connections: ['admin', 'right-vertical'] },
  'sports-main': { position: [0, 0, -60], connections: ['sports', 'main-vertical'] },
  'cafeteria-main': { position: [-35, 0, 20], connections: ['cafeteria', 'left-horizontal'] },
  'science-main': { position: [-35, 0, -40], connections: ['science', 'left-vertical'] },
  'engineering-main': { position: [35, 0, -40], connections: ['engineering', 'right-vertical'] },
  'arts-main': { position: [35, 0, 20], connections: ['arts', 'right-horizontal'] },
  'center-main': { position: [0, 0, 20], connections: ['student_center', 'main-vertical'] },

  // Main road intersections
  'main-vertical': { 
    position: [0, 0, 0], 
    connections: [
      'academic-main', 'center-main', 'sports-main',
      'left-horizontal', 'right-horizontal'
    ] 
  },
  'left-vertical': { 
    position: [-35, 0, -27.5], 
    connections: [
      'library-main', 'science-main',
      'left-horizontal'
    ] 
  },
  'right-vertical': { 
    position: [35, 0, -27.5], 
    connections: [
      'admin-main', 'engineering-main',
      'right-horizontal'
    ] 
  },
  'left-horizontal': { 
    position: [-17.5, 0, 20], 
    connections: [
      'main-vertical', 'left-vertical',
      'cafeteria-main'
    ] 
  },
  'right-horizontal': { 
    position: [17.5, 0, 20], 
    connections: [
      'main-vertical', 'right-vertical',
      'arts-main'
    ] 
  }
}

// Calculate distance between two 3D points
const distance = (point1, point2) => {
  return Math.sqrt(
    Math.pow(point2[0] - point1[0], 2) +
    Math.pow(point2[1] - point1[1], 2) +
    Math.pow(point2[2] - point1[2], 2)
  )
}

// Parse room identifier to get building and floor information
const parseRoomId = (roomId) => {
  const [building, floor, side] = roomId.split('-')
  return { building, floor: parseInt(floor), side }
}

// Get room position based on building position and room details
const getRoomPosition = (building, floor, side) => {
  const basePosition = roadGraph[building].position
  const xOffset = side === 'L' ? -5 : 5
  return [basePosition[0] + xOffset, floor * 4, basePosition[2]]
}

// Find shortest path between two buildings using Dijkstra's algorithm
const findShortestPath = (start, end) => {
  const distances = {}
  const previous = {}
  const unvisited = new Set(Object.keys(roadGraph))
  
  // Initialize distances
  Object.keys(roadGraph).forEach(node => {
    distances[node] = node === start ? 0 : Infinity
  })
  
  while (unvisited.size > 0) {
    // Find closest unvisited node
    let current = null
    let shortestDistance = Infinity
    
    unvisited.forEach(node => {
      if (distances[node] < shortestDistance) {
        shortestDistance = distances[node]
        current = node
      }
    })
    
    if (current === end) break
    if (current === null) break
    
    unvisited.delete(current)
    
    // Update distances to neighbors
    roadGraph[current].connections.forEach(neighbor => {
      if (!unvisited.has(neighbor)) return
      
      const alt = distances[current] + distance(
        roadGraph[current].position,
        roadGraph[neighbor].position
      )
      
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt
        previous[neighbor] = current
      }
    })
  }
  
  // Reconstruct path
  const path = []
  let current = end
  
  while (current !== undefined) {
    path.unshift(current)
    current = previous[current]
  }
  
  return path
}

// Generate complete path between two rooms
export const generatePath = (startRoom, endRoom) => {
  const { building: startBuilding, floor: startFloor, side: startSide } = parseRoomId(startRoom)
  const { building: endBuilding, floor: endFloor, side: endSide } = parseRoomId(endRoom)
  
  // Find path through road network
  const buildingPath = findShortestPath(startBuilding, endBuilding)
  const path = []
  
  // Add start room position
  const startRoomPos = getRoomPosition(startBuilding, startFloor, startSide)
  path.push(startRoomPos)
  
  // Add road intersection points
  for (let i = 0; i < buildingPath.length; i++) {
    const node = buildingPath[i]
    path.push(roadGraph[node].position)
  }
  
  // Add end room position
  const endRoomPos = getRoomPosition(endBuilding, endFloor, endSide)
  path.push(endRoomPos)
  
  return path
}