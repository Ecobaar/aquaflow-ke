
import React, { useState } from 'react'
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Alert,
  Snackbar
} from '@mui/material'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import { LoadingSpinner } from './LoadingSpinner'

const Calculator: React.FC = () => {
  const { user } = useAuth()
  const { handleError, handleSuccess } = useErrorHandler()
  const { isOnline, addPendingOperation } = useOfflineSync()
  
  const [amount, setAmount] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [loading, setLoading] = useState(false)
  const [liters, setLiters] = useState<any>(null)

  const calculateLiters = (amount: number) => {
    const result = {
      '20L': Math.floor(amount / 200),
      '10L': Math.floor((amount % 200) / 100),
      '5L': Math.floor(((amount % 200) % 100) / 50),
      '1L': Math.floor((((amount % 200) % 100) % 50) / 10),
      '0.5L': Math.floor(((((amount % 200) % 100) % 50) % 10) / 5),
      total_liters: 0
    }
    
    result.total_liters = (result['20L'] * 20) + (result['10L'] * 10) + 
                         (result['5L'] * 5) + (result['1L'] * 1) + (result['0.5L'] * 0.5)
    
    return result
  }

  const handleCalculate = () => {
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) {
      handleError(new Error('Please enter a valid amount'), 'Calculator')
      return
    }

    try {
      const result = calculateLiters(amt)
      setLiters(result)
    } catch (error) {
      handleError(error, 'Calculation failed')
    }
  }

  const handleRecordTransaction = async () => {
    if (!user) {
      handleError(new Error('Please log in to record transactions'), 'Authentication')
      return
    }

    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) {
      handleError(new Error('Please enter a valid amount'), 'Transaction')
      return
    }

    if (!customerName.trim()) {
      handleError(new Error('Please enter customer name'), 'Transaction')
      return
    }

    setLoading(true)

    try {
      const transactionData = {
        amount: amt,
        customer_name: customerName,
        payment_method: paymentMethod,
        user_id: user.id,
        description: `Water: ${liters?.total_liters || calculateLiters(amt).total_liters}L`
      }

      if (isOnline) {
        const { error } = await supabase
          .from('transactions')
          .insert(transactionData)

        if (error) throw error
        handleSuccess('Transaction recorded successfully!')
      } else {
        addPendingOperation({
          table: 'transactions',
          operation: 'insert',
          data: transactionData
        })
        handleSuccess('Transaction saved offline. Will sync when online.')
      }

      // Reset form
      setAmount('')
      setCustomerName('')
      setPaymentMethod('cash')
      setLiters(null)
      
    } catch (error) {
      handleError(error, 'Failed to record transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center">
        Water Calculator
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          label="Amount (KSh)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          margin="normal"
          inputProps={{ min: 0, step: 5 }}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleCalculate}
          sx={{ mt: 2, mb: 2 }}
          disabled={!amount}
        >
          Calculate Liters
        </Button>

        {liters && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Water Distribution:
            </Typography>
            <Typography>20L containers: {liters['20L']}</Typography>
            <Typography>10L containers: {liters['10L']}</Typography>
            <Typography>5L containers: {liters['5L']}</Typography>
            <Typography>1L containers: {liters['1L']}</Typography>
            <Typography>0.5L containers: {liters['0.5L']}</Typography>
            <Typography variant="h6" sx={{ mt: 1, borderTop: 1, pt: 1 }}>
              Total: {liters.total_liters}L
            </Typography>
          </Box>
        )}
      </Paper>

      {liters && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Record Transaction
          </Typography>

          <TextField
            fullWidth
            label="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              label="Payment Method"
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="till">Till Number</MenuItem>
              <MenuItem value="debt">Debt</MenuItem>
            </Select>
          </FormControl>

          {!isOnline && (
            <Alert severity="warning" sx={{ my: 2 }}>
              You're offline. Transaction will be saved locally and synced when online.
            </Alert>
          )}

          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={handleRecordTransaction}
            disabled={loading || !customerName.trim()}
            sx={{ mt: 2 }}
          >
            {loading ? <LoadingSpinner size={20} message="" /> : 'Record Transaction'}
          </Button>
        </Paper>
      )}
    </Box>
  )
}

export default Calculator
