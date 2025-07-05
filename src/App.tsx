
import React, { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline, CircularProgress, Box } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider as CustomThemeProvider, useTheme } from './contexts/ThemeContext'
import Auth from './components/Auth'
import Layout from './components/Layout'
import Calculator from './components/Calculator'
import Records from './components/Records'
import CustomerManager from './components/CustomerManager'
import Sales from './components/Sales'
import Reconciliation from './components/Reconciliation'
import Placeholder from './components/Placeholder'

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState(0)

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <Calculator />
      case 1:
        return <Records />
      case 2:
        return <Sales />
      case 3:
        return <Placeholder title="Debt Management" description="Track customer debts and repayments" />
      case 4:
        return <Placeholder title="Reports" description="Generate daily, weekly, monthly, and yearly sales summaries" />
      case 5:
        return <Placeholder title="Analytics" description="Visualize sales data and customer insights" />
      case 6:
        return <Placeholder title="Expenses" description="Track business expenses" />
      case 7:
        return <Reconciliation />
      default:
        return <Calculator />
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderTabContent()}
      </Layout>
    </ThemeProvider>
  )
}

const App: React.FC = () => {
  return (
    <CustomThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LocalizationProvider>
    </CustomThemeProvider>
  )
}

export default App
