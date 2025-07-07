
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
  Chip,
  IconButton,
  Alert,
  Card,
  CardContent,
  Grid,
} from '@mui/material'
import { Add, Edit, Delete, CheckCircle, MoneyOff } from '@mui/icons-material'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../contexts/AuthContext'
import dayjs from 'dayjs'

interface Debt {
  id: string
  customer_name: string
  amount: number
  description: string | null
  is_paid: boolean
  created_at: string
  paid_at: string | null
  due_date: string | null
}

const DebtManager: React.FC = () => {
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchDebts()
    }
  }, [user])

  const fetchDebts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDebts(data || [])
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!customerName.trim() || !amount) return

    setLoading(true)
    setError(null)

    try {
      if (editingDebt) {
        const { error } = await supabase
          .from('debts')
          .update({
            customer_name: customerName.trim(),
            amount: parseFloat(amount),
            description: description.trim() || null,
            due_date: dueDate || null,
          })
          .eq('id', editingDebt.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('debts')
          .insert({
            customer_name: customerName.trim(),
            amount: parseFloat(amount),
            description: description.trim() || null,
            due_date: dueDate || null,
            user_id: user?.id!,
          })

        if (error) throw error
      }

      setDialogOpen(false)
      resetForm()
      fetchDebts()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkPaid = async (debt: Debt) => {
    try {
      const { error } = await supabase
        .from('debts')
        .update({
          is_paid: true,
          paid_at: new Date().toISOString(),
        })
        .eq('id', debt.id)

      if (error) throw error
      fetchDebts()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleDelete = async (debt: Debt) => {
    if (!confirm(`Delete debt for ${debt.customer_name}?`)) return

    try {
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', debt.id)

      if (error) throw error
      fetchDebts()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt)
    setCustomerName(debt.customer_name)
    setAmount(debt.amount.toString())
    setDescription(debt.description || '')
    setDueDate(debt.due_date || '')
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingDebt(null)
    setCustomerName('')
    setAmount('')
    setDescription('')
    setDueDate('')
  }

  const openNewDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const totalOutstanding = debts
    .filter(debt => !debt.is_paid)
    .reduce((sum, debt) => sum + debt.amount, 0)

  const totalPaid = debts
    .filter(debt => debt.is_paid)
    .reduce((sum, debt) => sum + debt.amount, 0)

  if (loading && debts.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography>Loading debts...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" color="primary">
          Debt Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openNewDialog}
        >
          Add Debt
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Outstanding Debt
              </Typography>
              <Typography variant="h4" color="error">
                KSh {totalOutstanding.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Collected
              </Typography>
              <Typography variant="h4" color="success.main">
                KSh {totalPaid.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer</TableCell>
              <TableCell>Amount (KSh)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {debts.map((debt) => (
              <TableRow key={debt.id}>
                <TableCell>{debt.customer_name}</TableCell>
                <TableCell>{debt.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip
                    label={debt.is_paid ? 'Paid' : 'Outstanding'}
                    color={debt.is_paid ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {debt.due_date ? dayjs(debt.due_date).format('MMM DD, YYYY') : 'No due date'}
                </TableCell>
                <TableCell>
                  {dayjs(debt.created_at).format('MMM DD, YYYY')}
                </TableCell>
                <TableCell>
                  {!debt.is_paid && (
                    <IconButton
                      size="small"
                      onClick={() => handleMarkPaid(debt)}
                      color="success"
                      title="Mark as Paid"
                    >
                      <CheckCircle fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(debt)}
                    color="primary"
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(debt)}
                    color="error"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {debts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No debts recorded yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDebt ? 'Edit Debt' : 'Add New Debt'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Customer Name"
            fullWidth
            variant="outlined"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="Amount (KSh)"
            type="number"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
          />
          <TextField
            margin="dense"
            label="Due Date (Optional)"
            type="date"
            fullWidth
            variant="outlined"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading || !customerName.trim() || !amount}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DebtManager
