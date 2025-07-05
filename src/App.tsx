
import React, { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline, CircularProgress, Box } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Auth from './components/Auth'
import Layout from './components/Layout'
import Calculator from './components/Calculator'
import CustomerManager from './components/CustomerManager'
import Sales from './components/Sales'
import Placeholder from './components/Placeholder'

const theme = createTheme({
  palette: {
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

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState(0)

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
        return <CustomerManager />
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
        return <Placeholder title="Cash Reconciliation" description="Reconcile daily cash and till totals" />
      default:
        return <Calculator />
    }
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTabContent()}
    </Layout>
  )
}

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default App
