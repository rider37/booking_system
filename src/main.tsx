import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './style.css'
import { AppLayout } from './ui/AppLayout'
import { HomePage } from './pages/HomePage'
import { SeatPage } from './pages/SeatPage'
import { InfoPage } from './pages/InfoPage'
import { DonePage } from './pages/DonePage'
import { LookupPage } from './pages/LookupPage'
import { AdminPage } from './pages/AdminPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'seats', element: <SeatPage /> },
      { path: 'info', element: <InfoPage /> },
      { path: 'done', element: <DonePage /> },
      { path: 'lookup', element: <LookupPage /> },
      { path: 'admin', element: <AdminPage /> }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)


