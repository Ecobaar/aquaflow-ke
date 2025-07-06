
import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material'
import { Add, Edit, Delete, Check, AttachMoney } from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import dayjs, { Dayjs } from 'dayjs'

interface Debt {
  id: string
  customer_name: string
  amount: number
  description?: string
  is_paid: boolean
  created_at: string
  paid_at?: string
  due_date?: string
}

const DebtManager: React.FC = () => {
  const { user } = useAuth()
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState<Dayjs | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (user) {
      fetchDebts()
    }
  }, [user])

  const fetchDebts = async () => {
    try {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDebts(data || [])
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!customerName.trim() || !amount) {
      setMessage({ type: 'error', text: 'Customer name and amount are required' })
      return
    }

    try {
      if (editingDebt) {
        const { error } = await supabase
          .from('debts')
          .update({
            customer_name: customerName,
            amount: parseFloat(amount),
            description,
            due_date: dueDate?.format('YYYY-MM-DD') || null,
          })
          .eq('id', editingDebt.id)

        if (error) throw error
        setMessage({ type: 'success', text: 'Debt updated successfully!' })
      } else {
        const { error } = await supabase
          .from('debts')
          .insert({
            user_id: user?.id,
            customer_name: customerName,
            amount: parseFloat(amount),
            description,
            due_date: dueDate?.format('YYYY-MM-DD') || null,
          })

        if (error) throw error
        setMessage({ type: 'success', text: 'Debt added successfully!' })
      }

      handleClose()
      fetchDebts()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  const handleMarkPaid = async (debtId: string) => {
    try {
      const { error } = await supabase
        .from('debts')
        .update({
          is_paid: true,
          paid_at: new Date().toISOString(),
        })
        .eq('id', debtId)

      if (error) throw error
      setMessage({ type: 'success', text: 'Debt marked as paid!' })
      fetchDebts()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  const handleDelete = async (debtId: string) => {
    if (window.confirm('Are you sure you want to delete this debt record?')) {
      try {
        const { error } = await supabase
          .from('debts')
          .delete()
          .eq('id', debtId)

        if (error) throw error
        setMessage({ type: 'success', text: 'Debt deleted successfully!' })
        fetchDebts()
      } catch (error: any) {
        setMessage({ type: 'error', text: error.message })
      }
    }
  }

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt)
    setCustomerName(debt.customer_name)
    setAmount(debt.amount.toString())
    setDescription(debt.description || '')
    setDueDate(debt.due_date ? dayjs(debt.due_date) : null)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingDebt(null)
    setCustomerName('')
    setAmount('')
    setDescription('')
    setDueDate(null)
  }

  const totalDebt = debts.filter(d => !d.is_paid).reduce((sum, debt) => sum + debt.amount, 0)
  const paidDebt = debts.filter(d => d.is_paid).reduce((sum, debt) => sum + debt.amount, 0)

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom color="primary">
        Debt Management
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="error">
              Outstanding Debt
            </Typography>
            <Typography variant="h4">
              KSh {totalDebt.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="success.main">
              Paid Debt
            </Typography>
            <Typography variant="h4">
              KSh {paidDebt.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">
              Total Customers
            </Typography>
            <Typography variant="h4">
              {new Set(debts.map(d => d.customer_name)).size}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        Add New Debt
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer Name</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {debts.map((debt) => (
              <TableRow key={debt.id}>
                <TableCell>{debt.customer_name}</TableCell>
                <TableCell>KSh {debt.amount.toLocaleString()}</TableCell>
                <TableCell>{debt.description || '-'}</TableCell>
                <TableCell>
                  {debt.due_date ? dayjs(debt.due_date).format('MMM DD, YYYY') : '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={debt.is_paid ? 'Paid' : 'Outstanding'}
                    color={debt.is_paid ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {dayjs(debt.created_at).format('MMM DD, YYYY')}
                </TableCell>
                <TableCell>
                  {!debt.is_paid && (
                    <IconButton
                      onClick={() => handleMarkPaid(debt.id)}
                      color="success"
                      title="Mark as Paid"
                    >
                      <Check />
                    </IconButton>
                  )}
                  <IconButton
                    onClick={() => handleEdit(debt)}
                    color="primary"
                    title="Edit"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(debt.id)}
                    color="error"
                    title="Delete"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {debts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                  No debt records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDebt ? 'Edit Debt' : 'Add New Debt'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Amount (KSh)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={2}
          />
          <DatePicker
            label="Due Date (Optional)"
            value={dueDate}
            onChange={setDueDate}
            sx={{ mt: 2, width: '100%' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingDebt ? 'Update' : 'Add'} Debt
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DebtManager
