
import React, { useState } from 'react'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { supabase } from '@/integrations/supabase/client'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring'
import { LoadingSpinner } from './LoadingSpinner'

const Auth: React.FC = () => {
  const [tabValue, setTabValue] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { handleError, handleSuccess, handleWarning } = useErrorHandler()
  const { logSecurityEvent, isRateLimited } = useSecurityMonitoring()

  const validateForm = () => {
    if (!email.trim()) {
      handleError(new Error('Email is required'), 'Form Validation')
      return false
    }
    
    if (!email.includes('@')) {
      handleError(new Error('Please enter a valid email'), 'Form Validation')
      return false
    }

    if (!password) {
      handleError(new Error('Password is required'), 'Form Validation')
      return false
    }

    if (password.length < 6) {
      handleError(new Error('Password must be at least 6 characters'), 'Form Validation')
      return false
    }

    if (tabValue === 1 && password !== confirmPassword) {
      handleError(new Error('Passwords do not match'), 'Form Validation')
      return false
    }

    return true
  }

  const handleSignIn = async () => {
    if (!validateForm() || isRateLimited()) {
      if (isRateLimited()) {
        handleWarning('Too many failed attempts. Please try again later.')
      }
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        logSecurityEvent('failed_login', { email, error: error.message })
        throw error
      }

      logSecurityEvent('login', { email })
      handleSuccess('Successfully signed in!')
      
    } catch (error) {
      handleError(error, 'Sign In Failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const redirectUrl = `${window.location.origin}/`
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      })

      if (error) throw error

      if (data.user && !data.user.email_confirmed_at) {
        handleSuccess('Please check your email to confirm your account!')
      } else {
        handleSuccess('Account created successfully!')
      }
      
    } catch (error) {
      handleError(error, 'Sign Up Failed')
    } finally {
      setLoading(false)
    }
  }

  if (isRateLimited()) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 2 }}>
        <Paper sx={{ p: 4, maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Too many failed login attempts. Please try again later.
          </Alert>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 2 }}>
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h4" align="center" gutterBottom>
          AquaFlow254
        </Typography>
        
        <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)} variant="fullWidth" sx={{ mb: 3 }}>
          <Tab label="Sign In" />
          <Tab label="Sign Up" />
        </Tabs>

        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          autoComplete="email"
        />

        <TextField
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          autoComplete={tabValue === 0 ? 'current-password' : 'new-password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {tabValue === 1 && (
          <TextField
            fullWidth
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            autoComplete="new-password"
          />
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={tabValue === 0 ? handleSignIn : handleSignUp}
          disabled={loading}
          sx={{ mt: 3, mb: 2 }}
        >
          {loading ? (
            <LoadingSpinner size={20} message="" />
          ) : (
            tabValue === 0 ? 'Sign In' : 'Sign Up'
          )}
        </Button>

        {tabValue === 1 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            After signing up, please check your email to confirm your account.
          </Alert>
        )}
      </Paper>
    </Box>
  )
}

export default Auth
