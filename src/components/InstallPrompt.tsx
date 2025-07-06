
import React, { useState } from 'react'
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
  const { isInstallable, installApp } = usePWA()
  const [showPrompt, setShowPrompt] = useState(true)

  const handleInstall = async () => {
    const success = await installApp()
    if (success) {
      setShowPrompt(false)
    }
  }

  if (!isInstallable || !showPrompt) {
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
        Install AquaFlow for offline access!
      </Alert>
    </Snackbar>
  )
}

export default InstallPrompt
