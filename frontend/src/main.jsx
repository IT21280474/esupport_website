import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { router } from './App'
import { SiteProvider } from './contexts/SiteContext'
import './styles/app.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SiteProvider>
      <RouterProvider router={router} />
    </SiteProvider>
  </StrictMode>,
)
