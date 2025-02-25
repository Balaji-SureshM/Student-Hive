import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Canvas } from '@react-three/fiber'
import { CssBaseline } from '@mui/material'
import NavigationPanel from './components/NavigationPanel'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CssBaseline />
    <NavigationPanel />
    <Canvas
      camera={{
        position: [20, 20, 20],
        fov: 45,
        near: 0.1,
        far: 1000
      }}
    >
      <App />
    </Canvas>
  </React.StrictMode>
)