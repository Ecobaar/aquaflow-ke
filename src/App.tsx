
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { createTheme } from '@mui/material/styles'
import { AuthProvider } from './contexts/AuthContext'
import { AdminProvider } from './contexts/AdminContext'
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
import './App.css'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Auth />
  }

  return (
    <Layout>
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
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
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
