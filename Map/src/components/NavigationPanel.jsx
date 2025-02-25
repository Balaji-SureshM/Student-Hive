import React, { useState } from 'react'
import { Box, Button, Typography, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import useStore from '../store'
import { generatePath } from '../utils/pathfinding'

const NavigationPanel = () => {
  const {
    currentLocation,
    targetLocation,
    isNavigating,
    setTargetLocation,
    setIsNavigating,
    resetNavigation,
    setPath
  } = useStore()

  const [startRoom, setStartRoom] = useState('')
  const [endRoom, setEndRoom] = useState('')

  const buildings = ['academic', 'library', 'admin', 'sports', 'cafeteria', 'science', 'engineering', 'arts', 'student_center']

  const generateRoomOptions = (building) => {
    const floors = Math.floor({
      academic: 20,
      library: 15,
      admin: 12,
      sports: 10,
      cafeteria: 8,
      science: 18,
      engineering: 16,
      arts: 14,
      student_center: 12
    }[building] / 4)

    return Array.from({ length: floors }, (_, i) => [
      `${building}-${i + 1}-L`,
      `${building}-${i + 1}-R`
    ]).flat()
  }

  const handleNavigate = () => {
    if (!startRoom || !endRoom) return
    const path = generatePath(startRoom, endRoom)
    setPath(path)
    setIsNavigating(true)
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 100,
        width: 300,
        p: 2
      }}
      component={Paper}
      elevation={3}
    >
      <Typography variant="h6" gutterBottom>
        Campus Navigation
      </Typography>
      
      {/* Navigation Controls */}
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Start Room</InputLabel>
          <Select
            value={startRoom}
            label="Start Room"
            onChange={(e) => setStartRoom(e.target.value)}
          >
            {buildings.map(building => (
              <MenuItem key={building} disabled>
                {building.charAt(0).toUpperCase() + building.slice(1)}
              </MenuItem>
            )).concat(
              buildings.flatMap(building =>
                generateRoomOptions(building).map(room => (
                  <MenuItem key={room} value={room}>
                    {room}
                  </MenuItem>
                ))
              )
            )}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>End Room</InputLabel>
          <Select
            value={endRoom}
            label="End Room"
            onChange={(e) => setEndRoom(e.target.value)}
          >
            {buildings.map(building => (
              <MenuItem key={building} disabled>
                {building.charAt(0).toUpperCase() + building.slice(1)}
              </MenuItem>
            )).concat(
              buildings.flatMap(building =>
                generateRoomOptions(building).map(room => (
                  <MenuItem key={room} value={room}>
                    {room}
                  </MenuItem>
                ))
              )
            )}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          fullWidth
          onClick={handleNavigate}
          disabled={!startRoom || !endRoom}
        >
          Navigate
        </Button>

        {isNavigating && (
          <Button
            variant="outlined"
            fullWidth
            onClick={resetNavigation}
            sx={{ mt: 1 }}
          >
            Cancel Navigation
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default NavigationPanel