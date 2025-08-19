import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CalendarPage from './pages/CalendarPage'
import PlantCoordinatorPage from './pages/PlantCoordinatorPage'
import WorkforceCoordinatorPage from './pages/WorkforceCoordinatorPage'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './components/AuthProvider'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<LoginPage />} />
          <Route
            path='/'
            element={
              <ProtectedRoute roles={['plant_coordinator', 'workforce_coordinator']}>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/plant-coordinator'
            element={
              <ProtectedRoute roles={['plant_coordinator']}>
                <PlantCoordinatorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/workforce-coordinator'
            element={
              <ProtectedRoute roles={['workforce_coordinator']}>
                <WorkforceCoordinatorPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
