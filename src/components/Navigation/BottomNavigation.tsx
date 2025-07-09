
import React, { useState } from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Calculate,
  PointOfSale,
  AccountBalance,
  Inventory,
  Receipt,
  Assignment,
  MoreHoriz,
} from '@mui/icons-material';

interface BottomNavigationProps {
  activeTab: number;
  onTabChange: (newValue: number) => void;
}

const primaryTabs = [
  { label: 'Calculator', icon: <Calculate />, value: 0 },
  { label: 'Sales', icon: <PointOfSale />, value: 1 },
  { label: 'Debts', icon: <AccountBalance />, value: 2 },
  { label: 'More', icon: <MoreHoriz />, value: -1 }, // Special value for more menu
];

const secondaryTabs = [
  { label: 'Inventory', icon: <Inventory />, value: 3 },
  { label: 'Expenses', icon: <Receipt />, value: 4 },
  { label: 'Records', icon: <Assignment />, value: 5 },
];

export const CustomBottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSecondaryTabClick = (value: number) => {
    onTabChange(value);
    handleClose();
  };

  const getDisplayValue = () => {
    if (activeTab >= 3) return 3; // Show "More" as active for secondary tabs
    return activeTab;
  };

  const isSecondaryTabActive = activeTab >= 3;

  return (
    <>
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderTop: 1,
          borderColor: 'divider',
        }}
        elevation={8}
      >
        <BottomNavigation
          value={getDisplayValue()}
          onChange={(_, newValue) => {
            if (newValue === 3) {
              handleMoreClick({ currentTarget: document.querySelector('[data-more-button]') } as any);
            } else {
              onTabChange(newValue);
            }
          }}
          sx={{
            height: 64,
            '& .MuiBottomNavigationAction-root': {
              fontSize: '0.75rem',
              minWidth: 'auto',
              paddingTop: '6px',
            },
          }}
        >
          {primaryTabs.map((tab, index) => (
            <BottomNavigationAction
              key={tab.label}
              label={tab.label}
              icon={
                tab.value === -1 && isSecondaryTabActive ? (
                  <Badge variant="dot" color="primary">
                    {tab.icon}
                  </Badge>
                ) : (
                  tab.icon
                )
              }
              data-more-button={tab.value === -1}
              sx={{
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.75rem',
                  lineHeight: 1,
                  mt: 0.5,
                },
                ...(tab.value === -1 && isSecondaryTabActive && {
                  color: theme.palette.primary.main,
                }),
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            mb: 1,
            minWidth: 180,
          },
        }}
      >
        {secondaryTabs.map((tab) => (
          <MenuItem
            key={tab.label}
            onClick={() => handleSecondaryTabClick(tab.value)}
            selected={activeTab === tab.value}
          >
            <ListItemIcon>{tab.icon}</ListItemIcon>
            <ListItemText primary={tab.label} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
