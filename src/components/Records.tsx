
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
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
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
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    if (user) {
      fetchTransactions()
    }
  }, [user])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching transactions for user:', user?.id)
      
      // Direct query to transactions table with explicit user_id filter
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          amount,
          payment_method,
          customer_name,
          description,
          created_at,
          paid_status
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Fetched transactions:', data?.length || 0)
      setTransactions(data || [])
    } catch (error: any) {
      console.error('Error fetching transactions:', error)
      setError(error.message || 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setEditDialog(true)
  }

  const handleUpdate = async () => {
    if (!selectedTransaction || !user?.id) return

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
        .eq('user_id', user.id)

      if (error) throw error

      setEditDialog(false)
      setSelectedTransaction(null)
      fetchTransactions()
    } catch (error: any) {
      console.error('Update error:', error)
      setError(error.message)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?') || !user?.id) return

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      fetchTransactions()
    } catch (error: any) {
      console.error('Delete error:', error)
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
      <Box sx={{ p: { xs: 1, sm: 2 }, textAlign: 'center' }}>
        <Typography>Loading transactions...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, width: '100%', overflow: 'hidden' }}>
      <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom color="primary">
        Transaction Records
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer 
        component={Paper} 
        sx={{ 
          width: '100%',
          overflowX: 'auto',
          maxHeight: isMobile ? 'calc(100vh - 200px)' : 'none'
        }}
      >
        <Table stickyHeader={isMobile} size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: isMobile ? 80 : 'auto' }}>Date</TableCell>
              <TableCell sx={{ minWidth: isMobile ? 80 : 'auto' }}>Amount (KSh)</TableCell>
              <TableCell sx={{ minWidth: isMobile ? 80 : 'auto' }}>Payment</TableCell>
              {!isMobile && <TableCell>Customer</TableCell>}
              <TableCell sx={{ minWidth: isMobile ? 60 : 'auto' }}>Status</TableCell>
              <TableCell sx={{ minWidth: isMobile ? 80 : 'auto' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell sx={{ fontSize: isMobile ? '0.75rem' : 'inherit' }}>
                    {isMobile 
                      ? dayjs(transaction.created_at).format('MM/DD HH:mm')
                      : dayjs(transaction.created_at).format('MMM DD, YYYY HH:mm')
                    }
                  </TableCell>
                  <TableCell sx={{ fontSize: isMobile ? '0.75rem' : 'inherit' }}>
                    {transaction.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={isMobile ? transaction.payment_method.slice(0, 4) : transaction.payment_method}
                      color={getPaymentMethodColor(transaction.payment_method) as any}
                      size="small"
                      sx={{ fontSize: isMobile ? '0.6rem' : 'inherit' }}
                    />
                  </TableCell>
                  {!isMobile && (
                    <TableCell>{transaction.customer_name || 'Walk-in'}</TableCell>
                  )}
                  <TableCell>
                    <Chip
                      label={transaction.paid_status ? 'Paid' : 'Unpaid'}
                      color={transaction.paid_status ? 'success' : 'error'}
                      size="small"
                      sx={{ fontSize: isMobile ? '0.6rem' : 'inherit' }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(transaction)}
                      color="primary"
                    >
                      <Edit fontSize={isMobile ? 'small' : 'inherit'} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(transaction.id)}
                      color="error"
                    >
                      <Delete fontSize={isMobile ? 'small' : 'inherit'} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={isMobile ? 5 : 6} align="center">
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 25]}
          component="div"
          count={transactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10))
            setPage(0)
          }}
          sx={{
            '.MuiTablePagination-toolbar': {
              fontSize: isMobile ? '0.75rem' : 'inherit',
              minHeight: isMobile ? 40 : 52
            }
          }}
        />
      </TableContainer>

      <Dialog 
        open={editDialog} 
        onClose={() => setEditDialog(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
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
                size={isMobile ? 'small' : 'medium'}
              />
              <FormControl fullWidth margin="normal" size={isMobile ? 'small' : 'medium'}>
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
                size={isMobile ? 'small' : 'medium'}
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
                size={isMobile ? 'small' : 'medium'}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 1 : 2 }}>
          <Button onClick={() => setEditDialog(false)} size={isMobile ? 'small' : 'medium'}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdate} 
            variant="contained" 
            size={isMobile ? 'small' : 'medium'}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Records
