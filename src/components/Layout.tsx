
import React, { useState } from 'react'
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Calculator,
  Receipt,
  PointOfSale,
  AccountBalance,
  Analytics,
  Assessment,
  MoneyOff,
  AccountBalanceWallet,
  ExitToApp,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: React.ReactNode
  activeTab: number
  onTabChange: (tab: number) => void
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { signOut } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const tabs = [
    { label: 'Calculator', icon: <Calculator /> },
    { label: 'Records', icon: <Receipt /> },
    { label: 'Sale', icon: <PointOfSale /> },
    { label: 'Debts', icon: <AccountBalance /> },
    { label: 'Reports', icon: <Assessment /> },
    { label: 'Analytics', icon: <Analytics /> },
    { label: 'Expenses', icon: <MoneyOff /> },
    { label: 'Reconciliation', icon: <AccountBalanceWallet /> },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AquaFlow
          </Typography>
          <IconButton
            color="inherit"
            onClick={signOut}
            aria-label="sign out"
          >
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {children}
      </Box>

      <BottomNavigation
        value={activeTab}
        onChange={(_, newValue) => onTabChange(newValue)}
        showLabels
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            px: 1,
          },
        }}
      >
        {tabs.map((tab, index) => (
          <BottomNavigationAction
            key={index}
            label={isMobile ? '' : tab.label}
            icon={tab.icon}
            sx={{
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.7rem',
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Box>
  )
}

export default Layout
