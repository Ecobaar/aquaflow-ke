
import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Person,
  AdminPanelSettings,
  Business,
  MoreVert,
} from '@mui/icons-material'
import { CustomBottomNavigation } from './Navigation/BottomNavigation'

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

  return (
    <Box sx={{ 
      flexGrow: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      width: '100vw',
      overflow: 'hidden'
    }}>
      <AppBar position="static" elevation={1}>
        <Toolbar sx={{ minHeight: { xs: 48, sm: 64 } }}>
          <Typography 
            variant={isMobile ? 'h6' : 'h6'} 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
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
        pb: activeTab >= 0 ? { xs: 7, sm: 8 } : 0,
        width: '100%',
        minHeight: 0
      }}>
        {children}
      </Box>

      {activeTab >= 0 && (
        <CustomBottomNavigation
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      )}
    </Box>
  )
}

export default Layout
