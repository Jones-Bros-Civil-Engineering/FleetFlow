import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CalendarPage from './pages/CalendarPage'
import PlantCoordinatorPage from './pages/PlantCoordinatorPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CalendarPage />} />
        <Route path="/plant-coordinator" element={<PlantCoordinatorPage />} />
      </Routes>
    </BrowserRouter>
  )
}
