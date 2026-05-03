import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App'
import './index.css'
import './styles/auth.css'
import './styles/workouts.css'
import './styles/layout.css'
import './styles/components.css'
import "./styles/dashboard.css";
import "./styles/statistics.css";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)