import { create } from 'zustand'

const useStore = create((set) => ({
  // Navigation state
  currentLocation: 'entrance',
  targetLocation: null,
  isNavigating: false,
  path: [],
  
  // Building interaction state
  selectedBuilding: null,
  selectedRoom: null,

  // Camera controls
  cameraPosition: [20, 20, 20],
  cameraTarget: [0, 0, 0],

  // Classroom occupancy state
  classroomOccupancy: {
    academic: { left: Array(5).fill(false), right: Array(5).fill(false) },
    library: { left: Array(4).fill(false), right: Array(4).fill(false) },
    admin: { left: Array(3).fill(false), right: Array(3).fill(false) },
    sports: { left: Array(3).fill(false), right: Array(3).fill(false) },
    cafeteria: { left: Array(2).fill(false), right: Array(2).fill(false) },
    science: { left: Array(5).fill(false), right: Array(5).fill(false) },
    engineering: { left: Array(4).fill(false), right: Array(4).fill(false) },
    arts: { left: Array(4).fill(false), right: Array(4).fill(false) },
    student_center: { left: Array(3).fill(false), right: Array(3).fill(false) }
  },

  // Actions
  setCurrentLocation: (location) => set({ currentLocation: location }),
  setTargetLocation: (location) => set({ targetLocation: location }),
  setIsNavigating: (status) => set({ isNavigating: status }),
  setPath: (path) => set({ path }),
  setCameraPosition: (position) => set({ cameraPosition: position }),
  setCameraTarget: (target) => set({ cameraTarget: target }),
  toggleClassroomOccupancy: (building, side, index) => {
    set((state) => {
      const newOccupancy = JSON.parse(JSON.stringify(state.classroomOccupancy))
      if (newOccupancy[building] && newOccupancy[building][side]) {
        newOccupancy[building][side][index] = !newOccupancy[building][side][index]
      }
      return { classroomOccupancy: newOccupancy }
    })
  },

  // Reset navigation
  resetNavigation: () => set({
    targetLocation: null,
    isNavigating: false,
    path: []
  })
}))

export default useStore