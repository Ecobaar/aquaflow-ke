
import React from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
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
import InstallPrompt from './components/InstallPrompt'
import { LoadingSpinner } from './components/LoadingSpinner'
import NotFound from './pages/NotFound'
const Sales = React.lazy(() => import('./components/Sales'))
const Records = React.lazy(() => import('./components/Records'))
const Analytics = React.lazy(() => import('./components/Analytics'))
const Calculator = React.lazy(() => import('./components/Calculator'))
const Inventory = React.lazy(() => import('./components/Inventory'))
const Expenses = React.lazy(() => import('./components/Expenses'))
const CustomerManager = React.lazy(() => import('./components/CustomerManager'))
const DebtManager = React.lazy(() => import('./components/DebtManager'))
const StationManagement = React.lazy(() => import('./components/StationManagement'))
const UserProfile = React.lazy(() => import('./components/UserProfile'))
const AdminPanel = React.lazy(() => import('./components/AdminPanel'))
const Reconciliation = React.lazy(() => import('./components/Reconciliation'))
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
        <React.Suspense fallback={<LoadingSpinner />}>
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
          <Route path="/reconciliation" element={<Reconciliation />} />
          <Route path="/admin" element={isAdmin ? <AdminPanel /> : <Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </React.Suspense>
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
              <InstallPrompt />
              <AppContent />
            </Router>
          </AdminProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
