
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  PointOfSale,
  Assessment,
  Calculate,
  MoreVert,
  Inventory,
  MonetizationOn,
  Receipt,
  Business,
  Person,
  AccountBalance,
  Group,
} from '@mui/icons-material'

interface CustomBottomNavigationProps {
  activeTab: number
  onTabChange: (newValue: number) => void
}

export const CustomBottomNavigation: React.FC<CustomBottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const mainTabs = [
    { label: 'Sales', value: 0, icon: <PointOfSale /> },
    { label: 'Analytics', value: 1, icon: <Assessment /> },
    { label: 'Calculator', value: 2, icon: <Calculate /> },
  ]

  const moreTabs = [
    { label: 'Inventory', value: '/inventory', icon: <Inventory /> },
    { label: 'Expenses', value: '/expenses', icon: <MonetizationOn /> },
    { label: 'Records', value: '/records', icon: <Receipt /> },
    { label: 'Stations', value: '/stations', icon: <Business /> },
    { label: 'Customers', value: '/customers', icon: <Group /> },
    { label: 'Debts', value: '/debts', icon: <AccountBalance /> },
    { label: 'Profile', value: '/profile', icon: <Person /> },
  ]

  const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMoreClose = () => {
    setAnchorEl(null)
  }

  const handleMoreNavigate = (path: string) => {
    navigate(path)
    handleMoreClose()
  }

  const handleChange = (event: React.SyntheticEvent, newValue: number | string) => {
    if (newValue === 'more') {
      handleMoreClick(event as React.MouseEvent<HTMLElement>)
    } else if (typeof newValue === 'number') {
      onTabChange(newValue)
    }
  }

  const getCurrentValue = () => {
    if (activeTab >= 0) return activeTab
    const moreTab = moreTabs.find(tab => tab.value === location.pathname)
    return moreTab ? 'more' : activeTab
  }

  return (
    <>
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
        <BottomNavigation
          value={getCurrentValue()}
          onChange={handleChange}
          showLabels
        >
          {mainTabs.map((tab) => (
            <BottomNavigationAction
              key={tab.value}
              label={tab.label}
              value={tab.value}
              icon={tab.icon}
            />
          ))}
          <BottomNavigationAction
            label="More"
            value="more"
            icon={<MoreVert />}
          />
        </BottomNavigation>
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMoreClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        {moreTabs.map((tab) => (
          <MenuItem
            key={tab.value}
            onClick={() => handleMoreNavigate(tab.value)}
            selected={location.pathname === tab.value}
          >
            <ListItemIcon>{tab.icon}</ListItemIcon>
            <ListItemText>{tab.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default CustomBottomNavigation
