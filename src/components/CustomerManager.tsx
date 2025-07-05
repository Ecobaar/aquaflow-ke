
import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material'
import { Edit, Delete, Add } from '@mui/icons-material'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Customer {
  id: string
  name: string
  phone: string | null
  created_at: string
}

const CustomerManager: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchCustomers()
    }
  }, [user])

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user?.id)
        .order('name')

      if (error) throw error
      setCustomers(data || [])
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) return

    setLoading(true)
    setError(null)

    try {
      if (editingCustomer) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update({
            name: name.trim(),
            phone: phone.trim() || null,
          })
          .eq('id', editingCustomer.id)

        if (error) throw error
      } else {
        // Create new customer
        const { error } = await supabase
          .from('customers')
          .insert({
            name: name.trim(),
            phone: phone.trim() || null,
            user_id: user?.id!,
          })

        if (error) throw error
      }

      setDialogOpen(false)
      setEditingCustomer(null)
      setName('')
      setPhone('')
      fetchCustomers()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setName(customer.name)
    setPhone(customer.phone || '')
    setDialogOpen(true)
  }

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`Delete customer "${customer.name}"?`)) return

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customer.id)

      if (error) throw error
      fetchCustomers()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const openNewDialog = () => {
    setEditingCustomer(null)
    setName('')
    setPhone('')
    setDialogOpen(true)
  }

  return (
    <Box sx={{ p: 2, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" color="primary">
          Customer Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openNewDialog}
          size="large"
        >
          Add Customer
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        <List>
          {customers.map((customer) => (
            <ListItem key={customer.id} divider>
              <ListItemText
                primary={customer.name}
                secondary={customer.phone || 'No phone number'}
              />
              <ListItemSecondaryAction>
                <IconButton onClick={() => handleEdit(customer)} color="primary">
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(customer)} color="error">
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {customers.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No customers yet"
                secondary="Add your first customer to get started"
              />
            </ListItem>
          )}
        </List>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Customer Name"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="Phone Number"
            fullWidth
            variant="outlined"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading || !name.trim()}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CustomerManager
