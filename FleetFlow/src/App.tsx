import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CalendarPage from './pages/CalendarPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CalendarPage />} />
      </Routes>
    </BrowserRouter>
  )
}
