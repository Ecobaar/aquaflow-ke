
import React, { useState } from 'react'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Tab,
  Tabs,
  Container,
  IconButton,
  InputAdornment,
  Link,
  Divider,
} from '@mui/material'
import { Visibility, VisibilityOff, Refresh, Send } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

const Auth: React.FC = () => {
  const [tab, setTab] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [stationName, setStationName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [resetMode, setResetMode] = useState(false)

  const { signIn, signUp } = useAuth()

  const generatePassword = () => {
    const length = 12
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let result = ""
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setPassword(result)
    setShowPassword(true)
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      })
      
      if (error) throw error
      
      setSuccess('Password reset email sent! Check your inbox.')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (resetMode) {
      return handlePasswordReset(e)
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    if (tab === 0) {
      // Sign In
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      }
    } else {
      // Sign Up - include station name in metadata
      if (!stationName.trim()) {
        setError('Water station name is required')
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            station_name: stationName.trim()
          }
        }
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Check your email for the confirmation link!')
      }
    }

    setLoading(false)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  if (resetMode) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
            <Typography variant="h4" align="center" gutterBottom color="primary">
              Reset Password
            </Typography>
            <Typography variant="body2" align="center" sx={{ mb: 3 }}>
              Enter your email to receive a password reset link
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
              />

              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={<Send />}
                sx={{ mt: 3, py: 1.5 }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => setResetMode(false)}
                sx={{ mt: 2 }}
              >
                Back to Login
              </Button>
            </form>
          </Paper>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
          <Typography variant="h4" align="center" gutterBottom color="primary">
            AquaFlow
          </Typography>
          <Typography variant="body2" align="center" sx={{ mb: 3 }}>
            Water Refill Station Management
          </Typography>

          <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Sign In" />
            <Tab label="Sign Up" />
          </Tabs>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            
            {tab === 1 && (
              <TextField
                fullWidth
                label="Water Station Name"
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                margin="normal"
                required
                placeholder="e.g., Maji Fresh Water Station"
                helperText="This will help identify your business in the system"
              />
            )}
            
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                    {tab === 1 && (
                      <IconButton
                        onClick={generatePassword}
                        edge="end"
                        aria-label="generate password"
                        title="Generate secure password"
                      >
                        <Refresh />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
            />

            {tab === 1 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Click the refresh icon to generate a secure password
              </Typography>
            )}

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, py: 1.5 }}
            >
              {loading ? 'Loading...' : tab === 0 ? 'Sign In' : 'Sign Up'}
            </Button>

            {tab === 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => setResetMode(true)}
                  sx={{ display: 'block', textAlign: 'center' }}
                >
                  Forgot your password?
                </Link>
              </>
            )}
          </form>
        </Paper>
      </Box>
    </Container>
  )
}

export default Auth
