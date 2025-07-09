
import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Calculate,
  PointOfSale,
  AccountBalance,
  Inventory,
  Receipt,
  Assignment,
  Person,
  AdminPanelSettings,
  Business,
  MoreVert,
} from '@mui/icons-material'

interface LayoutProps {
  children: React.ReactNode
  activeTab: number
  onTabChange: (newValue: number) => void
  onProfileClick: () => void
  onAdminClick?: () => void
  onStationClick?: () => void
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  onProfileClick,
  onAdminClick,
  onStationClick,
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const tabs = [
    { label: 'Calculator', icon: <Calculate /> },
    { label: 'Sales', icon: <PointOfSale /> },
    { label: 'Debts', icon: <AccountBalance /> },
    { label: 'Inventory', icon: <Inventory /> },
    { label: 'Expenses', icon: <Receipt /> },
    { label: 'Records', icon: <Assignment /> },
  ]

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AquaFlow254
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {onStationClick && (
                <IconButton color="inherit" onClick={onStationClick}>
                  <Business />
                </IconButton>
              )}
              {onAdminClick && (
                <IconButton color="inherit" onClick={onAdminClick}>
                  <AdminPanelSettings />
                </IconButton>
              )}
              <IconButton color="inherit" onClick={onProfileClick}>
                <Person />
              </IconButton>
            </Box>
          )}

          {isMobile && (
            <>
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                {onStationClick && (
                  <MenuItem onClick={() => { onStationClick(); handleMenuClose(); }}>
                    <Business sx={{ mr: 1 }} />
                    Station Management
                  </MenuItem>
                )}
                {onAdminClick && (
                  <MenuItem onClick={() => { onAdminClick(); handleMenuClose(); }}>
                    <AdminPanelSettings sx={{ mr: 1 }} />
                    Admin Panel
                  </MenuItem>
                )}
                <MenuItem onClick={() => { onProfileClick(); handleMenuClose(); }}>
                  <Person sx={{ mr: 1 }} />
                  Profile
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ 
        bgcolor: 'background.default', 
        flexGrow: 1, 
        overflow: 'auto',
        pb: activeTab >= 0 ? 8 : 0 // Add padding bottom when tabs are visible
      }}>
        {children}
      </Box>

      {activeTab >= 0 && (
        <Box sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          zIndex: 1000
        }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => onTabChange(newValue)}
            variant={isMobile ? 'scrollable' : 'fullWidth'}
            scrollButtons={isMobile ? 'auto' : false}
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '0.75rem',
                padding: '6px 12px',
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                label={tab.label}
                iconPosition="top"
                sx={{
                  minHeight: 64,
                  textTransform: 'none',
                  fontSize: '0.75rem',
                }}
              />
            ))}
          </Tabs>
        </Box>
      )}
    </Box>
  )
}

export default Layout
