import { Route, Routes } from 'react-router'
import './App.css'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { PublicRoute } from './components/PublicRoute'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { WorkoutHistory } from './pages/WorkoutHistory'
import { WorkoutLog } from './pages/WorkoutLog'
import { Templates } from './pages/Templates'
import { AdminRoute } from './components/AdminRoute'
import { AdminUsers } from './pages/AdminUsers'
import { AdminExercises } from './pages/AdminExercises'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute> <Login /> </PublicRoute>} />
      <Route path='/register' element={<PublicRoute> <Register /> </PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="workouts" element={<WorkoutHistory />} />
        <Route path="newworkout" element={<WorkoutLog />} />
        <Route path="newworkout/:workoutId" element={<WorkoutLog />} />
        <Route path="templates" element={<Templates />} />
      </Route>
      <Route path="/admin/" element={
        <ProtectedRoute>
          <AdminRoute>
            <Layout />
          </AdminRoute>
        </ProtectedRoute>
      }>
        <Route path="users" element={<AdminUsers />} />
        <Route path="exercises" element={<AdminExercises />} />
      </Route>
    </Routes>
  )
}

export default App
