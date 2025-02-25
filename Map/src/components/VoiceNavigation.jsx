import React, { useEffect } from 'react'
import useStore from '../store'

const VoiceNavigation = () => {
  const { path, isNavigating, currentLocation } = useStore()

  const generateVoiceInstructions = (path) => {
    if (!path || path.length < 2) return []
    
    const instructions = []
    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i]
      const next = path[i + 1]
      const dx = next[0] - current[0]
      const dy = next[1] - current[1]
      const dz = next[2] - current[2]

      // Determine direction
      if (Math.abs(dy) > 0) {
        instructions.push(`Go ${dy > 0 ? 'up' : 'down'} to floor ${Math.abs(Math.floor(next[1] / 4))}`)
      } else {
        const angle = Math.atan2(dz, dx) * (180 / Math.PI)
        if (angle > -45 && angle <= 45) {
          instructions.push('Go right')
        } else if (angle > 45 && angle <= 135) {
          instructions.push('Go straight')
        } else if (angle > 135 || angle <= -135) {
          instructions.push('Go left')
        } else {
          instructions.push('Go back')
        }
      }
    }
    return instructions
  }

  const speakInstruction = (instruction) => {
    const utterance = new SpeechSynthesisUtterance(instruction)
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    if (isNavigating && path.length > 0) {
      const instructions = generateVoiceInstructions(path)
      instructions.forEach((instruction, index) => {
        setTimeout(() => speakInstruction(instruction), index * 3000)
      })
    } else {
      window.speechSynthesis.cancel()
    }

    return () => {
      window.speechSynthesis.cancel()
    }
  }, [isNavigating, path])

  return null
}

export default VoiceNavigation