import React, { useState } from 'react'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  Divider,
} from '@mui/material'
import { Calculate, Save, History } from '@mui/icons-material'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../contexts/AuthContext'

const Calculator: React.FC = () => {
  const [cashInput, setCashInput] = useState<string>('')
  const [tillInput, setTillInput] = useState<string>('')
  const [debtInput, setDebtInput] = useState<string>('')
  const [cashTotal, setCashTotal] = useState<number>(0)
  const [tillTotal, setTillTotal] = useState<number>(0)
  const [debtTotal, setDebtTotal] = useState<number>(0)
  const [grandTotal, setGrandTotal] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const { user } = useAuth()

  // Function to evaluate mathematical expressions and comma-separated values
  const calculateAmount = (input: string): number => {
    if (!input.trim()) return 0
    
    try {
      // Replace commas with plus signs for calculation
      let expression = input.replace(/,/g, '+')
      
      // Remove any spaces
      expression = expression.replace(/\s/g, '')
      
      // Validate that the expression only contains numbers, +, -, *, /, (, ), and .
      if (!/^[0-9+\-*/().]+$/.test(expression)) {
        throw new Error('Invalid characters in expression')
      }
      
      // Use Function constructor to safely evaluate the expression
      const result = new Function('return ' + expression)()
      
      if (isNaN(result) || !isFinite(result)) {
        throw new Error('Invalid calculation result')
      }
      
      return Number(result.toFixed(2))
    } catch (error) {
      console.error('Calculation error:', error)
      return 0
    }
  }

  const handleCalculate = () => {
    const cash = calculateAmount(cashInput)
    const till = calculateAmount(tillInput)
    const debt = calculateAmount(debtInput)
    const total = cash + till + debt

    setCashTotal(cash)
    setTillTotal(till)
    setDebtTotal(debt)
    setGrandTotal(total)
    setMessage(null)
  }

  const handleSave = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'Please log in to save records' })
      return
    }

    if (grandTotal === 0) {
      setMessage({ type: 'error', text: 'Please calculate totals first' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const today = new Date().toISOString().split('T')[0]

      // Check if a record for today already exists
      const { data: existingRecord, error: fetchError } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('daily_summaries')
          .update({
            cash_total: cashTotal,
            till_total: tillTotal,
            debt_total: debtTotal,
            total_sales: grandTotal,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRecord.id)

        if (updateError) throw updateError
        setMessage({ type: 'success', text: 'Daily summary updated successfully!' })
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('daily_summaries')
          .insert({
            user_id: user.id,
            date: today,
            cash_total: cashTotal,
            till_total: tillTotal,
            debt_total: debtTotal,
            total_sales: grandTotal
          })

        if (insertError) throw insertError
        setMessage({ type: 'success', text: 'Daily summary saved successfully!' })
      }

      // Also create individual transactions for record keeping
      const transactions = []
      
      if (cashTotal > 0) {
        transactions.push({
          user_id: user.id,
          amount: cashTotal,
          payment_method: 'cash',
          description: `Daily cash total: ${cashInput}`,
          customer_name: 'Daily Summary'
        })
      }
      
      if (tillTotal > 0) {
        transactions.push({
          user_id: user.id,
          amount: tillTotal,
          payment_method: 'till',
          description: `Daily till total: ${tillInput}`,
          customer_name: 'Daily Summary'
        })
      }
      
      if (debtTotal > 0) {
        transactions.push({
          user_id: user.id,
          amount: debtTotal,
          payment_method: 'debt',
          description: `Daily debt total: ${debtInput}`,
          customer_name: 'Daily Summary'
        })
      }

      if (transactions.length > 0) {
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert(transactions)

        if (transactionError) {
          console.error('Transaction insertion error:', transactionError)
        }
      }

    } catch (error: any) {
      console.error('Save error:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to save daily summary' })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setCashInput('')
    setTillInput('')
    setDebtInput('')
    setCashTotal(0)
    setTillTotal(0)
    setDebtTotal(0)
    setGrandTotal(0)
    setMessage(null)
  }

  return (
    <Box sx={{ p: 2, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Calculate />
        Daily Sales Calculator
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Typography variant="h6" gutterBottom>
              Enter amounts (use commas or math like: 100+200+300 or 100,200,300)
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Cash Sales"
              value={cashInput}
              onChange={(e) => setCashInput(e.target.value)}
              placeholder="e.g., 1000+500 or 1000,500,200"
              helperText="Separate amounts with commas or use + - * /"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Till/M-Pesa Sales"
              value={tillInput}
              onChange={(e) => setTillInput(e.target.value)}
              placeholder="e.g., 2000+1500 or 2000,1500,800"
              helperText="Separate amounts with commas or use + - * /"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Credit/Debt Sales"
              value={debtInput}
              onChange={(e) => setDebtInput(e.target.value)}
              placeholder="e.g., 500+300 or 500,300,200"
              helperText="Separate amounts with commas or use + - * /"
            />
          </Grid>

          <Grid size={12}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={handleCalculate}
                size="large"
                sx={{ flex: 1, minWidth: '150px' }}
              >
                Calculate Totals
              </Button>
              <Button
                variant="outlined"
                onClick={handleSave}
                disabled={loading || grandTotal === 0}
                size="large"
                startIcon={<Save />}
                sx={{ flex: 1, minWidth: '150px' }}
              >
                {loading ? 'Saving...' : 'Save Daily Summary'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleReset}
                size="large"
                sx={{ flex: 1, minWidth: '150px' }}
              >
                Reset
              </Button>
            </Box>
          </Grid>

          {message && (
            <Grid size={12}>
              <Alert severity={message.type}>
                {message.text}
              </Alert>
            </Grid>
          )}
        </Grid>
      </Paper>

      {(cashTotal > 0 || tillTotal > 0 || debtTotal > 0) && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Cash Total
                </Typography>
                <Typography variant="h4">
                  KSh {cashTotal.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ bgcolor: 'info.main', color: 'info.contrastText' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Till/M-Pesa Total
                </Typography>
                <Typography variant="h4">
                  KSh {tillTotal.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ bgcolor: 'warning.main', color: 'warning.contrastText' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Credit/Debt Total
                </Typography>
                <Typography variant="h4">
                  KSh {debtTotal.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Grand Total
                </Typography>
                <Typography variant="h3">
                  KSh {grandTotal.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                  {new Date().toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Calculation Breakdown
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="body2" color="textSecondary">Cash Input</Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', mb: 1 }}>
                      {cashInput || 'No input'}
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      = KSh {cashTotal.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="body2" color="textSecondary">Till Input</Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', mb: 1 }}>
                      {tillInput || 'No input'}
                    </Typography>
                    <Typography variant="body2" color="info.main">
                      = KSh {tillTotal.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="body2" color="textSecondary">Credit Input</Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', mb: 1 }}>
                      {debtInput || 'No input'}
                    </Typography>
                    <Typography variant="body2" color="warning.main">
                      = KSh {debtTotal.toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default Calculator
