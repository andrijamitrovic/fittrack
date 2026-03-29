import { Route, Routes } from 'react-router'
import './App.css'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dasboard'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />}/>
      <Route path='/register' element={<Register />}/>
      <Route path='/' element={<Dashboard />}/>
    </Routes>
  )
}

export default App
