
import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Avatar,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material'
import { Person, ExitToApp, Settings, Save, Business } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import type { Tables } from '@/integrations/supabase/types'

interface UserProfile {
  id: string
  email: string
  full_name?: string
  phone?: string
  business_name?: string
  station_name?: string
}

const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stationProfile, setStationProfile] = useState<Tables<'profiles'> | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (user) {
      setProfile({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || '',
        business_name: user.user_metadata?.business_name || '',
        station_name: user.user_metadata?.station_name || '',
      })
      fetchStationProfile()
    }
  }, [user])

  const fetchStationProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error
      setStationProfile(data)
    } catch (error) {
      console.error('Error fetching station profile:', error)
    }
  }

  const handleSave = async () => {
    if (!profile) return

    setSaving(true)
    setMessage(null)

    try {
      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          phone: profile.phone,
          business_name: profile.business_name,
          station_name: profile.station_name,
        }
      })

      if (authError) throw authError

      // Update or insert station profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          station_name: profile.station_name,
          updated_at: new Date().toISOString(),
        })

      if (profileError) throw profileError

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      fetchStationProfile()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      setMessage({ type: 'error', text: 'Error signing out' })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!profile) return null

  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom color="primary">
        Profile & Settings
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{ 
              width: 80, 
              height: 80, 
              mr: 2, 
              bgcolor: 'primary.main',
              fontSize: '1.5rem'
            }}
          >
            {profile.full_name ? getInitials(profile.full_name) : <Person />}
          </Avatar>
          <Box>
            <Typography variant="h6">
              {profile.full_name || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profile.email}
            </Typography>
            {stationProfile?.station_name && (
              <Typography variant="body2" color="primary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <Business sx={{ fontSize: 16, mr: 0.5 }} />
                {stationProfile.station_name}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
          Profile Information
        </Typography>

        <TextField
          fullWidth
          label="Full Name"
          value={profile.full_name || ''}
          onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Phone Number"
          value={profile.phone || ''}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Water Station Name"
          value={profile.station_name || ''}
          onChange={(e) => setProfile({ ...profile, station_name: e.target.value })}
          margin="normal"
          helperText="This is your business name that will be used throughout the system"
          required
        />

        <TextField
          fullWidth
          label="Business Name (Optional)"
          value={profile.business_name || ''}
          onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
          margin="normal"
          helperText="Additional business information"
        />

        <TextField
          fullWidth
          label="Email"
          value={profile.email}
          margin="normal"
          disabled
          helperText="Email cannot be changed here"
        />

        {message && (
          <Alert severity={message.type} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        )}

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={<Save />}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          App Settings
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
            />
          }
          label="Dark Mode"
        />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom color="error">
          Account Actions
        </Typography>

        <Button
          variant="outlined"
          color="error"
          onClick={handleLogout}
          startIcon={<ExitToApp />}
          fullWidth
        >
          Sign Out
        </Button>
      </Paper>
    </Box>
  )
}

export default UserProfile
