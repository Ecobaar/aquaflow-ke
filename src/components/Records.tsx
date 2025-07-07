
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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  TablePagination,
} from '@mui/material'
import { Edit, Delete, Visibility } from '@mui/icons-material'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../contexts/AuthContext'
import dayjs from 'dayjs'

interface Transaction {
  id: number
  amount: number
  payment_method: string
  customer_name: string | null
  description: string | null
  created_at: string
  paid_status: boolean
}

const Records: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editDialog, setEditDialog] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchTransactions()
    }
  }, [user])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setEditDialog(true)
  }

  const handleUpdate = async () => {
    if (!selectedTransaction) return

    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          amount: selectedTransaction.amount,
          payment_method: selectedTransaction.payment_method,
          customer_name: selectedTransaction.customer_name,
          description: selectedTransaction.description,
          paid_status: selectedTransaction.paid_status,
        })
        .eq('id', selectedTransaction.id)

      if (error) throw error

      setEditDialog(false)
      setSelectedTransaction(null)
      fetchTransactions()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchTransactions()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'success'
      case 'till': return 'primary'
      case 'debt': return 'warning'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography>Loading transactions...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom color="primary">
        Transaction Records
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Amount (KSh)</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {dayjs(transaction.created_at).format('MMM DD, YYYY HH:mm')}
                  </TableCell>
                  <TableCell>{transaction.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.payment_method}
                      color={getPaymentMethodColor(transaction.payment_method) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{transaction.customer_name || 'Walk-in'}</TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.paid_status ? 'Paid' : 'Unpaid'}
                      color={transaction.paid_status ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(transaction)}
                      color="primary"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(transaction.id)}
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={transactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10))
            setPage(0)
          }}
        />
      </TableContainer>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Transaction</DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={selectedTransaction.amount}
                onChange={(e) => setSelectedTransaction({
                  ...selectedTransaction,
                  amount: parseFloat(e.target.value) || 0
                })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={selectedTransaction.payment_method}
                  onChange={(e) => setSelectedTransaction({
                    ...selectedTransaction,
                    payment_method: e.target.value
                  })}
                  label="Payment Method"
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="till">Till</MenuItem>
                  <MenuItem value="debt">Debt</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Customer Name"
                value={selectedTransaction.customer_name || ''}
                onChange={(e) => setSelectedTransaction({
                  ...selectedTransaction,
                  customer_name: e.target.value || null
                })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Description"
                value={selectedTransaction.description || ''}
                onChange={(e) => setSelectedTransaction({
                  ...selectedTransaction,
                  description: e.target.value || null
                })}
                margin="normal"
                multiline
                rows={2}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Records
