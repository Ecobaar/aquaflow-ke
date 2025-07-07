
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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
} from '@mui/material'
import { Add, Edit, Delete, Receipt } from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import dayjs, { Dayjs } from 'dayjs'

interface Expense {
  id: number
  description: string
  amount: number
  created_at: string
}

const Expenses: React.FC = () => {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs())
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (user) {
      fetchExpenses()
    }
  }, [user])

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setExpenses(data || [])
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!description.trim() || !amount) {
      setMessage({ type: 'error', text: 'Description and amount are required' })
      return
    }

    try {
      if (editingExpense) {
        const { error } = await supabase
          .from('expenses')
          .update({
            description,
            amount: parseFloat(amount),
          })
          .eq('id', editingExpense.id)

        if (error) throw error
        setMessage({ type: 'success', text: 'Expense updated successfully!' })
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert({
            user_id: user?.id,
            description,
            amount: parseFloat(amount),
            created_at: selectedDate?.toISOString() || new Date().toISOString(),
          })

        if (error) throw error
        setMessage({ type: 'success', text: 'Expense added successfully!' })
      }

      handleClose()
      fetchExpenses()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  const handleDelete = async (expenseId: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', expenseId)

        if (error) throw error
        setMessage({ type: 'success', text: 'Expense deleted successfully!' })
        fetchExpenses()
      } catch (error: any) {
        setMessage({ type: 'error', text: error.message })
      }
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setDescription(expense.description)
    setAmount(expense.amount.toString())
    setSelectedDate(dayjs(expense.created_at))
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingExpense(null)
    setDescription('')
    setAmount('')
    setSelectedDate(dayjs())
  }

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const thisMonthExpenses = expenses
    .filter(e => dayjs(e.created_at).isSame(dayjs(), 'month'))
    .reduce((sum, expense) => sum + expense.amount, 0)
  const todayExpenses = expenses
    .filter(e => dayjs(e.created_at).isSame(dayjs(), 'day'))
    .reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom color="primary">
        <Receipt sx={{ mr: 1, verticalAlign: 'middle' }} />
        Expense Management
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Today's Expenses
            </Typography>
            <Typography variant="h5" color="error">
              KSh {todayExpenses.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              This Month
            </Typography>
            <Typography variant="h5" color="warning.main">
              KSh {thisMonthExpenses.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Expenses
            </Typography>
            <Typography variant="h5">
              KSh {totalExpenses.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        Add New Expense
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>
                  {dayjs(expense.created_at).format('MMM DD, YYYY')}
                </TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>KSh {expense.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleEdit(expense)}
                    color="primary"
                    title="Edit"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(expense.id)}
                    color="error"
                    title="Delete"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {expenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center', py: 3 }}>
                  No expenses found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingExpense ? 'Edit Expense' : 'Add New Expense'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            required
            placeholder="e.g., Water pump maintenance, Electricity bill"
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
          {!editingExpense && (
            <DatePicker
              label="Date"
              value={selectedDate}
              onChange={setSelectedDate}
              sx={{ mt: 2, width: '100%' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingExpense ? 'Update' : 'Add'} Expense
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Expenses
