
import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
} from '@mui/material'
import { Receipt, Add, Edit, Delete } from '@mui/icons-material'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../contexts/AuthContext'

interface Expense {
  id: number
  description: string
  amount: number
  created_at: string
}

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [monthlyTotal, setMonthlyTotal] = useState(0)

  const { user } = useAuth()

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
      
      const expenseData = data || []
      setExpenses(expenseData)
      
      // Calculate totals
      const total = expenseData.reduce((sum, expense) => sum + expense.amount, 0)
      setTotalExpenses(total)
      
      // Calculate monthly total
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const monthlyExpenses = expenseData.filter(expense => {
        const expenseDate = new Date(expense.created_at)
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
      })
      const monthly = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      setMonthlyTotal(monthly)
      
    } catch (error) {
      console.error('Error fetching expenses:', error)
      setMessage({ type: 'error', text: 'Failed to fetch expenses' })
    }
  }

  const handleSubmit = async () => {
    if (!description || !amount) return

    setLoading(true)
    setMessage(null)

    try {
      const expenseData = {
        description: description,
        amount: parseFloat(amount),
        user_id: user!.id
      }

      if (editingExpense) {
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', editingExpense.id)

        if (error) throw error
        setMessage({ type: 'success', text: 'Expense updated successfully!' })
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert(expenseData)

        if (error) throw error
        setMessage({ type: 'success', text: 'Expense added successfully!' })
      }

      setDescription('')
      setAmount('')
      setEditingExpense(null)
      setDialogOpen(false)
      fetchExpenses()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (error) throw error
      setMessage({ type: 'success', text: 'Expense deleted successfully!' })
      fetchExpenses()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense)
    setDescription(expense.description)
    setAmount(expense.amount.toString())
    setDialogOpen(true)
  }

  const openAddDialog = () => {
    setEditingExpense(null)
    setDescription('')
    setAmount('')
    setDialogOpen(true)
  }

  return (
    <Box sx={{ p: 2, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Receipt />
        Expense Tracking
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Expenses</Typography>
              <Typography variant="h4" color="error">
                KSh {totalExpenses.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All time expenses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>This Month</Typography>
              <Typography variant="h4" color="warning.main">
                KSh {monthlyTotal.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Expense Records</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openAddDialog}
          >
            Add Expense
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount (KSh)</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell align="right">{expense.amount.toLocaleString()}</TableCell>
                  <TableCell>{new Date(expense.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => openEditDialog(expense)} size="small">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(expense.id)} size="small" color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No expenses recorded. Add your first expense to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Expense Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
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
            placeholder="e.g., Water pump maintenance, Electricity bill"
          />
          <TextField
            fullWidth
            label="Amount (KSh)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            margin="normal"
            inputProps={{ min: 0, step: 0.01 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading || !description || !amount}>
            {loading ? 'Saving...' : (editingExpense ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Expenses
