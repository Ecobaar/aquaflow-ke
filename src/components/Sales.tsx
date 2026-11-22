
import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../contexts/AuthContext'

interface Customer {
  id: number
  name: string
}

const Sales: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'till' | 'debt'>('cash')
  const [customerId, setCustomerId] = useState('')
  const [paidStatus, setPaidStatus] = useState(true)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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
        .select('id, name')
        .eq('user_id', user?.id)
        .order('name')

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const selectedCustomer = customers.find(c => c.id === parseInt(customerId))
      
      const { error } = await supabase
        .from('transactions')
        .insert({
          amount: parseFloat(amount),
          payment_method: paymentMethod,
          customer_id: customerId ? parseInt(customerId) : null,
          customer_name: selectedCustomer?.name || null,
          paid_status: paymentMethod === 'debt' ? false : paidStatus,
          user_id: user!.id,
          description: description.trim() || null,
        })

      if (error) throw error

      setSuccess('Sale recorded successfully!')
      setAmount('')
      setCustomerId('')
      setDescription('')
      setPaidStatus(true)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom color="primary">
        Record New Sale
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Amount (KSh)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            margin="normal"
            required
            inputProps={{ min: 0, step: 0.01 }}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'till' | 'debt')}
              label="Payment Method"
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="till">Till</MenuItem>
              <MenuItem value="debt">Debt</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Customer</InputLabel>
            <Select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              label="Customer"
            >
              <MenuItem value="">None</MenuItem>
              {customers.map((customer) => (
                <MenuItem key={customer.id} value={customer.id.toString()}>
                  {customer.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={2}
          />

          {paymentMethod !== 'debt' && (
            <FormControlLabel
              control={
                <Switch
                  checked={paidStatus}
                  onChange={(e) => setPaidStatus(e.target.checked)}
                />
              }
              label="Paid"
              sx={{ mt: 2 }}
            />
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || !amount}
            sx={{ mt: 3, py: 1.5 }}
          >
            {loading ? 'Recording...' : 'Record Sale'}
          </Button>
        </form>
      </Paper>
    </Box>
  )
}

export default Sales
