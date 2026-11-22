
import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from '@mui/material'
import { Business, PersonAdd, Share, Delete } from '@mui/icons-material'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../contexts/AuthContext'

interface Station {
  id: string
  name: string
  owner_id: string
  created_at: string
}

interface StationMember {
  id: string
  user_id: string
  role: string
  joined_at: string
  user_email?: string
}

const StationManagement: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([])
  const [members, setMembers] = useState<StationMember[]>([])
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [stationName, setStationName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchStations()
    }
  }, [user])

  const fetchStations = async () => {
    try {
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setStations(data || [])
    } catch (error) {
      console.error('Error fetching stations:', error)
    }
  }

  const fetchStationMembers = async (stationId: string) => {
    try {
      const { data, error } = await supabase
        .from('station_members')
        .select(`
          *,
          user_id
        `)
        .eq('station_id', stationId)

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error fetching station members:', error)
    }
  }

  const handleCreateStation = async () => {
    if (!stationName.trim()) return

    setLoading(true)
    setMessage(null)

    try {
      const { data, error } = await supabase
        .from('stations')
        .insert({
          name: stationName,
          owner_id: user!.id
        })
        .select()
        .single()

      if (error) throw error

      // Add the owner as a member
      await supabase
        .from('station_members')
        .insert({
          station_id: data.id,
          user_id: user!.id,
          role: 'owner'
        })

      setMessage({ type: 'success', text: 'Station created successfully!' })
      setStationName('')
      setDialogOpen(false)
      fetchStations()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleInviteEmployee = async () => {
    if (!inviteEmail.trim() || !selectedStation) return

    setLoading(true)
    setMessage(null)

    try {
      // For now, we'll create a simple invitation system
      // In a real app, you'd send an email invitation
      const inviteLink = `${window.location.origin}/?invite=${selectedStation.id}&email=${inviteEmail}`
      
      // Copy to clipboard
      await navigator.clipboard.writeText(inviteLink)
      
      setMessage({ 
        type: 'success', 
        text: `Invitation link copied to clipboard! Share it with ${inviteEmail}` 
      })
      setInviteEmail('')
      setInviteDialogOpen(false)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create invitation link' })
    } finally {
      setLoading(false)
    }
  }

  const handleStationSelect = (station: Station) => {
    setSelectedStation(station)
    fetchStationMembers(station.id)
  }

  const isOwner = (station: Station) => station.owner_id === user?.id

  return (
    <Box sx={{ p: 2, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Business />
        Station Management
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Your Water Stations</Typography>
          <Button
            variant="contained"
            startIcon={<Business />}
            onClick={() => setDialogOpen(true)}
          >
            Create Station
          </Button>
        </Box>

        {stations.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No stations found. Create your first water station to get started.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {stations.map((station) => (
              <Card 
                key={station.id} 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedStation?.id === station.id ? 2 : 1,
                  borderColor: selectedStation?.id === station.id ? 'primary.main' : 'divider'
                }}
                onClick={() => handleStationSelect(station)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6">{station.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Created: {new Date(station.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip 
                        label={isOwner(station) ? 'Owner' : 'Member'} 
                        color={isOwner(station) ? 'primary' : 'default'}
                        size="small"
                      />
                      {isOwner(station) && (
                        <Button
                          size="small"
                          startIcon={<PersonAdd />}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedStation(station)
                            setInviteDialogOpen(true)
                          }}
                        >
                          Invite Employee
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>

      {selectedStation && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {selectedStation.name} - Team Members
          </Typography>
          
          {members.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No team members found.
            </Typography>
          ) : (
            <List>
              {members.map((member) => (
                <ListItem key={member.id}>
                  <ListItemText
                    primary={`User ID: ${member.user_id}`}
                    secondary={`Role: ${member.role} • Joined: ${new Date(member.joined_at).toLocaleDateString()}`}
                  />
                  <ListItemSecondaryAction>
                    <Chip label={member.role} size="small" />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      )}

      {/* Create Station Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Water Station</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Station Name"
            value={stationName}
            onChange={(e) => setStationName(e.target.value)}
            margin="normal"
            placeholder="e.g., Aquamist-Kahawa"
            helperText="Choose a unique name for your water station"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateStation} variant="contained" disabled={loading || !stationName.trim()}>
            {loading ? 'Creating...' : 'Create Station'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invite Employee Dialog */}
      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite Employee</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Invite an employee to join {selectedStation?.name}
          </Typography>
          <TextField
            fullWidth
            label="Employee Email"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            margin="normal"
            placeholder="employee@example.com"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleInviteEmployee} variant="contained" disabled={loading || !inviteEmail.trim()}>
            {loading ? 'Creating Invite...' : 'Create Invite Link'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default StationManagement
