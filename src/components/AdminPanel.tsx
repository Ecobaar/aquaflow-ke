
import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent,
} from '@mui/material'
import { AdminPanelSettings, People, Business } from '@mui/icons-material'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../contexts/AuthContext'

interface UserProfile {
  id: string
  email: string
  created_at: string
  station_name?: string
}

interface UserRole {
  id: string
  user_id: string
  role: string
  created_at: string
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [roles, setRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assignRoleDialog, setAssignRoleDialog] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [newRole, setNewRole] = useState<'admin' | 'moderator' | 'user'>('user')

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchUsers()
      fetchRoles()
    }
  }, [user])

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, station_name, created_at')

      if (error) throw error

      const usersWithProfiles = profiles?.map(profile => ({
        id: profile.id,
        email: 'user@example.com',
        created_at: profile.created_at,
        station_name: profile.station_name,
      })) || []

      setUsers(usersWithProfiles)
    } catch (error: any) {
      setError(error.message)
    }
  }

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')

      if (error) throw error
      setRoles(data || [])
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignRole = async () => {
    if (!selectedUserId || !newRole) return

    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: selectedUserId,
          role: newRole,
        })

      if (error) throw error

      setAssignRoleDialog(false)
      setSelectedUserId('')
      setNewRole('user')
      fetchRoles()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const getUserRole = (userId: string) => {
    const userRole = roles.find(role => role.user_id === userId)
    return userRole?.role || 'user'
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error'
      case 'moderator': return 'warning'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography>Loading admin panel...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AdminPanelSettings />
        Admin Panel
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <People />
                Total Users
              </Typography>
              <Typography variant="h4">
                {users.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AdminPanelSettings />
                Admins
              </Typography>
              <Typography variant="h4" color="error">
                {roles.filter(role => role.role === 'admin').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Business />
                Active Stations
              </Typography>
              <Typography variant="h4" color="primary">
                {users.filter(user => user.station_name).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">User Management</Typography>
          <Button
            variant="contained"
            onClick={() => setAssignRoleDialog(true)}
          >
            Assign Role
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User ID</TableCell>
                <TableCell>Station Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id.slice(0, 8)}...</TableCell>
                  <TableCell>{user.station_name || 'Not set'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getUserRole(user.id)}
                      color={getRoleColor(getUserRole(user.id)) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={assignRoleDialog} onClose={() => setAssignRoleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign User Role</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="User ID"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Role"
            select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as 'admin' | 'moderator' | 'user')}
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignRoleDialog(false)}>Cancel</Button>
          <Button onClick={handleAssignRole} variant="contained">
            Assign Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminPanel
