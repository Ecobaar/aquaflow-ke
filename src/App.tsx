
import React, { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline, CircularProgress, Box } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AdminProvider, useAdmin } from './contexts/AdminContext'
import { ThemeProvider as CustomThemeProvider, useTheme } from './contexts/ThemeContext'
import Auth from './components/Auth'
import Layout from './components/Layout'
import Calculator from './components/Calculator'
import Records from './components/Records'
import CustomerManager from './components/CustomerManager'
import Sales from './components/Sales'
import Reconciliation from './components/Reconciliation'
import UserProfile from './components/UserProfile'
import AdminPanel from './components/AdminPanel'
import InstallPrompt from './components/InstallPrompt'
import DebtManager from './components/DebtManager'
import Analytics from './components/Analytics'
import Expenses from './components/Expenses'
import Placeholder from './components/Placeholder'

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()
  const { isAdmin } = useAdmin()
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState(0)
  const [showProfile, setShowProfile] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)

  const theme = createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#4caf50',
      },
    },
    typography: {
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
    },
  })

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    return <Auth />
  }

  if (showProfile) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Layout 
          activeTab={-1} 
          onTabChange={() => {}} 
          onProfileClick={() => setShowProfile(false)}
          onAdminClick={isAdmin ? () => setShowAdmin(true) : undefined}
        >
          <UserProfile />
        </Layout>
      </ThemeProvider>
    )
  }

  if (showAdmin && isAdmin) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Layout 
          activeTab={-1} 
          onTabChange={() => {}} 
          onProfileClick={() => setShowProfile(true)}
          onAdminClick={() => setShowAdmin(false)}
        >
          <AdminPanel />
        </Layout>
      </ThemeProvider>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <Calculator />
      case 1:
        return <Records />
      case 2:
        return <Sales />
      case 3:
        return <DebtManager />
      case 4:
        return <Placeholder title="Reports" description="Generate daily, weekly, monthly, and yearly sales summaries" />
      case 5:
        return <Analytics />
      case 6:
        return <Expenses />
      case 7:
        return <Reconciliation />
      default:
        return <Calculator />
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onProfileClick={() => setShowProfile(true)}
        onAdminClick={isAdmin ? () => setShowAdmin(true) : undefined}
      >
        {renderTabContent()}
      </Layout>
      <InstallPrompt />
    </ThemeProvider>
  )
}

const App: React.FC = () => {
  return (
    <CustomThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AuthProvider>
          <AdminProvider>
            <AppContent />
          </AdminProvider>
        </AuthProvider>
      </LocalizationProvider>
    </CustomThemeProvider>
  )
}

export default App
