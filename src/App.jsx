import { useState } from 'react'
import './App.css'
import Roulette from './pages/roulette'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Roulette />
    </>
  )
}

export default App
