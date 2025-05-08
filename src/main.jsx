import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'remixicon/fonts/remixicon.css'

import 'bootstrap/dist/css/bootstrap.min.css';
import  "./dist/css/main.css"

import App from './App'
import RegisterPage from './pages/registerPage';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import BarangKeluarPage from './pages/BarangKeluarPage'
import SuplayerPage from './pages/SuplayerPage'
import DataBarangPage from './pages/DataBarangPage'
import ChartPage from './pages/chartPage'
import Testing from './pages/Testing'
import DataEOQ from './pages/DataEOQ'
import EditUserPage from './pages/EdituserPage'
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/admindashboard',
    element: <AdminDashboardPage />,
  },
  {
    path: '/barangkeluar',
    element: <BarangKeluarPage />,
  },
  {
    path: '/suplayer',
    element: <SuplayerPage />,
  },
  {
    path: '/databarang',
    element: <DataBarangPage />,
  },
  {
    path: '/chart',
    element: <ChartPage />,
  },
  {
    path: '/dataEoq',
    element: <DataEOQ />,
  },
  {
    path: 'User',
    element: <EditUserPage />,
  },
  {
    path: '/testing',
    element: <Testing />,
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <RouterProvider router={router} />
  </StrictMode>,
)
