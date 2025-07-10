
import React, { useState } from 'react'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Card,
  CardContent,
} from '@mui/material'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../contexts/AuthContext'

const Calculator: React.FC = () => {
  const [cashInput, setCashInput] = useState('')
  const [tillInput, setTillInput] = useState('')
  const [cashTotal, setCashTotal] = useState(0)
  const [tillTotal, setTillTotal] = useState(0)
  const [grandTotal, setGrandTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { user } = useAuth()

  const calculateTotal = (input: string): number => {
    if (!input.trim()) return 0
    
    try {
      // Handle both comma-separated and plus-separated values
      const values = input
        .replace(/\s+/g, '') // Remove all whitespace
        .split(/[,+]/) // Split by comma or plus
        .filter(val => val.length > 0)
        .map(val => {
          const num = parseFloat(val)
          if (isNaN(num)) throw new Error(`Invalid number: ${val}`)
          return num
        })
      
      return values.reduce((sum, val) => sum + val, 0)
    } catch (err) {
      throw new Error('Please enter valid numbers separated by commas or plus signs')
    }
  }

  const handleCashCalculation = () => {
    try {
      setError(null)
      const total = calculateTotal(cashInput)
      setCashTotal(total)
      updateGrandTotal(total, tillTotal)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleTillCalculation = () => {
    try {
      setError(null)
      const total = calculateTotal(tillInput)
      setTillTotal(total)
      updateGrandTotal(cashTotal, total)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const updateGrandTotal = (cash: number, till: number) => {
    setGrandTotal(cash + till)
  }

  const handleSaveRecord = async () => {
    if (grandTotal <= 0) {
      setError('Please calculate totals before saving')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const currentDate = new Date().toISOString()
      
      // Save to daily_summaries table
      const { error: summaryError } = await supabase
        .from('daily_summaries')
        .upsert({
          user_id: user?.id!,
          date: currentDate.split('T')[0], // Just the date part
          cash_total: cashTotal,
          till_total: tillTotal,
          total_sales: grandTotal,
          debt_total: 0,
          updated_at: currentDate
        }, {
          onConflict: 'user_id,date'
        })

      if (summaryError) throw summaryError

      // Also create a transaction record for tracking
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id!,
          amount: grandTotal,
          payment_method: 'mixed', // Since it's cash + till
          description: `Daily total: Cash ${cashTotal}, Till ${tillTotal}`,
          created_at: currentDate
        })

      if (transactionError) throw transactionError

      setSuccess('Daily totals saved successfully!')
      
      // Reset form
      setCashInput('')
      setTillInput('')
      setCashTotal(0)
      setTillTotal(0)
      setGrandTotal(0)
      
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom color="primary">
        Daily Money Calculator
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Cash Calculation
        </Typography>
        <TextField
          fullWidth
          label="Cash amounts (e.g., 100+200+320 or 220,110,300)"
          value={cashInput}
          onChange={(e) => setCashInput(e.target.value)}
          placeholder="100+200+50 or 100,200,50"
          margin="normal"
          multiline
          rows={2}
        />
        <Button 
          variant="contained" 
          onClick={handleCashCalculation}
          sx={{ mt: 1, mb: 2 }}
        >
          Calculate Cash Total
        </Button>
        {cashTotal > 0 && (
          <Typography variant="h6" color="success.main">
            Cash Total: KSh {cashTotal.toLocaleString()}
          </Typography>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Till Calculation
        </Typography>
        <TextField
          fullWidth
          label="Till amounts (e.g., 500+300+200 or 500,300,200)"
          value={tillInput}
          onChange={(e) => setTillInput(e.target.value)}
          placeholder="500+300+100 or 500,300,100"
          margin="normal"
          multiline
          rows={2}
        />
        <Button 
          variant="contained" 
          onClick={handleTillCalculation}
          sx={{ mt: 1, mb: 2 }}
        >
          Calculate Till Total
        </Button>
        {tillTotal > 0 && (
          <Typography variant="h6" color="success.main">
            Till Total: KSh {tillTotal.toLocaleString()}
          </Typography>
        )}
      </Paper>

      {grandTotal > 0 && (
        <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <CardContent>
            <Typography variant="h5" align="center">
              Grand Total: KSh {grandTotal.toLocaleString()}
            </Typography>
            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
              Cash: KSh {cashTotal.toLocaleString()} | Till: KSh {tillTotal.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      )}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        onClick={handleSaveRecord}
        disabled={loading || grandTotal <= 0}
        sx={{ py: 2 }}
      >
        {loading ? 'Saving...' : 'Save Daily Record'}
      </Button>
    </Box>
  )
}

export default Calculator
