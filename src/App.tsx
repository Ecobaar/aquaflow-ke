
import React from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { createTheme } from '@mui/material/styles'
import { AuthProvider } from './contexts/AuthContext'
import { AdminProvider } from './contexts/AdminContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { OfflineIndicator } from './components/OfflineIndicator'
import Layout from './components/Layout'
import Auth from './components/Auth'
import Sales from './components/Sales'
import Records from './components/Records'
import Analytics from './components/Analytics'
import Calculator from './components/Calculator'
import Inventory from './components/Inventory'
import Expenses from './components/Expenses'
import CustomerManager from './components/CustomerManager'
import DebtManager from './components/DebtManager'
import StationManagement from './components/StationManagement'
import UserProfile from './components/UserProfile'
import AdminPanel from './components/AdminPanel'
import { useAuth } from './contexts/AuthContext'
import { useAdmin } from './contexts/AdminContext'
import { useTheme } from './contexts/ThemeContext'
import './App.css'

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()
  const { isAdmin } = useAdmin()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  // Create dynamic theme based on current theme
  const muiTheme = React.useMemo(() => createTheme({
    palette: {
      mode: theme,
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  }), [theme])

  // Map routes to tab indices
  const getActiveTab = () => {
    switch (location.pathname) {
      case '/':
      case '/sales':
        return 0 // Sales
      case '/analytics':
        return 1 // Analytics
      case '/calculator':
        return 2 // Calculator
      default:
        return -1 // For routes in "More" menu
    }
  }

  const handleTabChange = (newValue: number) => {
    switch (newValue) {
      case 0:
        navigate('/sales')
        break
      case 1:
        navigate('/analytics')
        break
      case 2:
        navigate('/calculator')
        break
    }
  }

  const handleProfileClick = () => {
    navigate('/profile')
  }

  const handleAdminClick = () => {
    if (isAdmin) {
      navigate('/admin')
    }
  }

  const handleStationClick = () => {
    navigate('/stations')
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Auth />
  }

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Layout
        activeTab={getActiveTab()}
        onTabChange={handleTabChange}
        onProfileClick={handleProfileClick}
        onAdminClick={isAdmin ? handleAdminClick : undefined}
        onStationClick={handleStationClick}
      >
        <Routes>
          <Route path="/" element={<Sales />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/records" element={<Records />} />
          <Route path="/customers" element={<CustomerManager />} />
          <Route path="/debts" element={<DebtManager />} />
          <Route path="/stations" element={<StationManagement />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Layout>
    </MuiThemeProvider>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AdminProvider>
            <Router>
              <OfflineIndicator />
              <AppContent />
            </Router>
          </AdminProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
