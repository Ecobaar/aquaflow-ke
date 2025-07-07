import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Divider,
} from '@mui/material'
import { AccountBalanceWallet, TrendingUp, TrendingDown } from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../contexts/AuthContext'
import dayjs, { Dayjs } from 'dayjs'

interface ReconciliationData {
  totalSales: number
  cashSales: number
  tillSales: number
  debtSales: number
  totalExpenses: number
  netProfit: number
  outstandingDebt: number
}

const Reconciliation: React.FC = () => {
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().startOf('month'))
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs())
  const [data, setData] = useState<ReconciliationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuth()

  const fetchReconciliationData = async () => {
    if (!startDate || !endDate || !user) return

    setLoading(true)
    setError(null)

    try {
      const start = startDate.startOf('day').toISOString()
      const end = endDate.endOf('day').toISOString()

      // Fetch transactions
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('amount, payment_method')
        .eq('user_id', user.id)
        .gte('created_at', start)
        .lte('created_at', end)

      if (transError) throw transError

      // Fetch expenses
      const { data: expenses, error: expError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id)
        .gte('created_at', start)
        .lte('created_at', end)

      if (expError) throw expError

      // Fetch outstanding debts
      const { data: debts, error: debtError } = await supabase
        .from('debts')
        .select('amount')
        .eq('user_id', user.id)
        .eq('is_paid', false)

      if (debtError) throw debtError

      // Calculate totals
      const totalSales = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0
      const cashSales = transactions?.filter(t => t.payment_method === 'cash').reduce((sum, t) => sum + t.amount, 0) || 0
      const tillSales = transactions?.filter(t => t.payment_method === 'till').reduce((sum, t) => sum + t.amount, 0) || 0
      const debtSales = transactions?.filter(t => t.payment_method === 'debt').reduce((sum, t) => sum + t.amount, 0) || 0
      const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0
      const outstandingDebt = debts?.reduce((sum, d) => sum + d.amount, 0) || 0
      const netProfit = totalSales - totalExpenses

      setData({
        totalSales,
        cashSales,
        tillSales,
        debtSales,
        totalExpenses,
        netProfit,
        outstandingDebt,
      })
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && startDate && endDate) {
      fetchReconciliationData()
    }
  }, [user])

  const handleReconcile = () => {
    fetchReconciliationData()
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccountBalanceWallet />
        Daily Reconciliation
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid xs={12} md={4}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid xs={12} md={4}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleReconcile}
              disabled={loading || !startDate || !endDate}
            >
              {loading ? 'Processing...' : 'Reconcile'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {data && (
        <Grid container spacing={3}>
          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Sales
                </Typography>
                <Typography variant="h4" color="primary">
                  KSh {data.totalSales.toLocaleString()}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid xs={6}>
                    <Typography variant="body2" color="textSecondary">Cash</Typography>
                    <Typography variant="h6">KSh {data.cashSales.toLocaleString()}</Typography>
                  </Grid>
                  <Grid xs={6}>
                    <Typography variant="body2" color="textSecondary">Till</Typography>
                    <Typography variant="h6">KSh {data.tillSales.toLocaleString()}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Expenses
                </Typography>
                <Typography variant="h4" color="error">
                  KSh {data.totalExpenses.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {data.netProfit >= 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
                  Net Profit/Loss
                </Typography>
                <Typography 
                  variant="h4" 
                  color={data.netProfit >= 0 ? "success.main" : "error"}
                >
                  KSh {data.netProfit.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Outstanding Debt
                </Typography>
                <Typography variant="h4" color="warning.main">
                  KSh {data.outstandingDebt.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Summary for {startDate?.format('MMM DD')} - {endDate?.format('MMM DD, YYYY')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid xs={12} md={3}>
                    <Typography variant="body2" color="textSecondary">Cash Sales</Typography>
                    <Typography variant="h6">KSh {data.cashSales.toLocaleString()}</Typography>
                  </Grid>
                  <Grid xs={12} md={3}>
                    <Typography variant="body2" color="textSecondary">Till Sales</Typography>
                    <Typography variant="h6">KSh {data.tillSales.toLocaleString()}</Typography>
                  </Grid>
                  <Grid xs={12} md={3}>
                    <Typography variant="body2" color="textSecondary">Debt Sales</Typography>
                    <Typography variant="h6">KSh {data.debtSales.toLocaleString()}</Typography>
                  </Grid>
                  <Grid xs={12} md={3}>
                    <Typography variant="body2" color="textSecondary">Cash Flow</Typography>
                    <Typography 
                      variant="h6" 
                      color={data.cashSales + data.tillSales - data.totalExpenses >= 0 ? "success.main" : "error"}
                    >
                      KSh {(data.cashSales + data.tillSales - data.totalExpenses).toLocaleString()}
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

export default Reconciliation
