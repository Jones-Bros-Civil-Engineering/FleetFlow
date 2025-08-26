import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CalendarPage from './pages/CalendarPage'
import PlantCoordinatorPage from './pages/PlantCoordinatorPage'
import WorkforceCoordinatorPage from './pages/WorkforceCoordinatorPage'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './components/AuthProvider'
import UnauthorizedPage from './pages/UnauthorizedPage'
import AdminPage from './pages/AdminPage'
import ExternalHiresPage from './pages/ExternalHiresPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/unauthorized' element={<UnauthorizedPage />} />
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
            <Route
              path='/external-hires'
              element={
                <ProtectedRoute roles={['plant_coordinator']}>
                  <ExternalHiresPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/admin'
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
