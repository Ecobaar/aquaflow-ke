
import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { Balance, Warning, CheckCircle } from '@mui/icons-material'
import dayjs, { Dayjs } from 'dayjs'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../contexts/AuthContext'

interface DailySummary {
  date: string
  cash_total: number
  till_total: number
  total_sales: number
}

const Reconciliation: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
  const [actualCash, setActualCash] = useState('')
  const [actualTill, setActualTill] = useState('')
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null)
  const [loading, setLoading] = useState(false)

  const { user } = useAuth()

  useEffect(() => {
    if (user && selectedDate) {
      fetchDailySummary()
    }
  }, [user, selectedDate])

  const fetchDailySummary = async () => {
    try {
      setLoading(true)
      const dateStr = selectedDate.format('YYYY-MM-DD')
      
      const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', dateStr)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setDailySummary(data)
    } catch (error: any) {
      console.error('Error fetching daily summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount)
  }

  const expectedCash = dailySummary ? Number(dailySummary.cash_total) : 0
  const expectedTill = dailySummary ? Number(dailySummary.till_total) : 0
  const actualCashNum = parseFloat(actualCash) || 0
  const actualTillNum = parseFloat(actualTill) || 0

  const cashDifference = actualCashNum - expectedCash
  const tillDifference = actualTillNum - expectedTill
  const totalDifference = cashDifference + tillDifference

  const getStatusIcon = (difference: number) => {
    if (Math.abs(difference) < 0.01) return <CheckCircle color="success" />
    return <Warning color="warning" />
  }

  return (
    <Box sx={{ p: 2, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom color="primary">
        Cash Reconciliation
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>What is Reconciliation?</strong><br />
          Reconciliation helps you verify that your actual cash and till amounts match your expected sales totals. 
          This process helps identify discrepancies, missing transactions, or errors in your daily sales recording.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select Date & Enter Actual Amounts
            </Typography>
            
            <DatePicker
              label="Reconciliation Date"
              value={selectedDate}
              onChange={(newValue) => newValue && setSelectedDate(newValue)}
              sx={{ mb: 2, width: '100%' }}
            />

            <TextField
              fullWidth
              label="Actual Cash Amount (KSh)"
              type="number"
              value={actualCash}
              onChange={(e) => setActualCash(e.target.value)}
              margin="normal"
              inputProps={{ min: 0, step: 0.01 }}
            />

            <TextField
              fullWidth
              label="Actual Till Amount (KSh)"
              type="number"
              value={actualTill}
              onChange={(e) => setActualTill(e.target.value)}
              margin="normal"
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Expected vs Actual
            </Typography>

            {dailySummary ? (
              <Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Payment Method</TableCell>
                        <TableCell align="right">Expected</TableCell>
                        <TableCell align="right">Actual</TableCell>
                        <TableCell align="right">Difference</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Cash</TableCell>
                        <TableCell align="right">{formatCurrency(expectedCash)}</TableCell>
                        <TableCell align="right">{formatCurrency(actualCashNum)}</TableCell>
                        <TableCell align="right">
                          <Typography color={cashDifference >= 0 ? 'success.main' : 'error.main'}>
                            {cashDifference >= 0 ? '+' : ''}{formatCurrency(cashDifference)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {getStatusIcon(cashDifference)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Till</TableCell>
                        <TableCell align="right">{formatCurrency(expectedTill)}</TableCell>
                        <TableCell align="right">{formatCurrency(actualTillNum)}</TableCell>
                        <TableCell align="right">
                          <Typography color={tillDifference >= 0 ? 'success.main' : 'error.main'}>
                            {tillDifference >= 0 ? '+' : ''}{formatCurrency(tillDifference)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {getStatusIcon(tillDifference)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider sx={{ my: 2 }} />

                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Balance sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        Total Reconciliation
                      </Typography>
                    </Box>
                    <Typography variant="h4" color={totalDifference >= 0 ? 'success.main' : 'error.main'}>
                      {totalDifference >= 0 ? '+' : ''}{formatCurrency(totalDifference)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Math.abs(totalDifference) < 0.01 
                        ? '✅ Perfect match! Your records are accurate.'
                        : totalDifference > 0 
                        ? '⚠️ You have more cash than expected. Check for unrecorded sales.'
                        : '⚠️ You have less cash than expected. Check for missing transactions or errors.'
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ) : (
              <Alert severity="info">
                No sales data found for {selectedDate.format('MMM DD, YYYY')}. 
                Make sure you have recorded sales for this date.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Reconciliation Tips
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            Count your actual cash and till amounts at the end of each business day
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            Compare with your expected amounts from recorded sales
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            Investigate any discrepancies - they might indicate missing transactions or errors
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            Regular reconciliation helps maintain accurate financial records
          </Typography>
          <Typography component="li" variant="body2">
            Keep reconciliation records for audit purposes and business analysis
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default Reconciliation
