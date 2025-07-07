
import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material'
import { GetApp, Close } from '@mui/icons-material'
import { usePWA } from '../hooks/usePWA'

const InstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, installApp } = usePWA()
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Show prompt only if installable and not already installed
    if (isInstallable && !isInstalled) {
      // Wait a bit before showing the prompt to not be intrusive
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [isInstallable, isInstalled])

  const handleInstall = async () => {
    const success = await installApp()
    if (success) {
      setShowPrompt(false)
    }
  }

  // Don't show if not installable, already installed, or user dismissed
  if (!isInstallable || isInstalled || !showPrompt) {
    return null
  }

  return (
    <Snackbar
      open={true}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ mb: 8 }}
    >
      <Alert
        severity="info"
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              color="inherit"
              size="small"
              onClick={handleInstall}
              startIcon={<GetApp />}
            >
              Install
            </Button>
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setShowPrompt(false)}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        Install AquaFlow for offline access and better performance!
      </Alert>
    </Snackbar>
  )
}

export default InstallPrompt
