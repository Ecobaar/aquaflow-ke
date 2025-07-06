
import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material'
import { AdminPanelSettings, PersonAdd } from '@mui/icons-material'
import { useAdmin } from '../contexts/AdminContext'

const AdminPanel: React.FC = () => {
  const { assignAdminRole, getUserRoles } = useAdmin()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    loadUserRoles()
  }, [])

  const loadUserRoles = async () => {
    const { data, error } = await getUserRoles()
    if (error) {
      console.error('Error loading user roles:', error)
    } else {
      setUsers(data)
    }
  }

  const handleAssignAdmin = async () => {
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter an email address' })
      return
    }

    setLoading(true)
    setMessage(null)

    const { error } = await assignAdminRole(email.trim())

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Admin role assigned successfully!' })
      setEmail('')
      loadUserRoles()
    }

    setLoading(false)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error'
      case 'moderator': return 'warning'
      default: return 'default'
    }
  }

  return (
    <Box sx={{ p: 2, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom color="primary">
        <AdminPanelSettings sx={{ mr: 1, verticalAlign: 'middle' }} />
        Admin Panel
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Assign Admin Role
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            label="User Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter user email to make them admin"
            type="email"
          />
          <Button
            variant="contained"
            onClick={handleAssignAdmin}
            disabled={loading}
            startIcon={<PersonAdd />}
            sx={{ minWidth: 140 }}
          >
            {loading ? 'Assigning...' : 'Assign Admin'}
          </Button>
        </Box>

        {message && (
          <Alert severity={message.type} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          User Roles
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User ID</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Assigned Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {user.user_id}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      color={getRoleColor(user.role)}
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
                  <TableCell colSpan={3} sx={{ textAlign: 'center', py: 3 }}>
                    No user roles found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}

export default AdminPanel
