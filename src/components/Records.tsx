
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
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TrendingUp, TrendingDown, AccountBalance, Receipt } from '@mui/icons-material'
import dayjs, { Dayjs } from 'dayjs'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../contexts/AuthContext'

interface DailySummary {
  id: string
  date: string
  cash_total: number
  till_total: number
  debt_total: number
  total_sales: number
}

interface Transaction {
  id: number
  amount: number
  payment_method: string
  customer_name: string | null
  description: string | null
  created_at: string
}

const Records: React.FC = () => {
  const [summaries, setSummaries] = useState<DailySummary[]>([])
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchDailySummaries()
    }
  }, [user])

  const fetchDailySummaries = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(30)

      if (error) throw error
      setSummaries(data || [])
    } catch (error: any) {
      console.error('Error fetching daily summaries:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactionsForDate = async (date: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', `${date}T00:00:00.000Z`)
        .lt('created_at', `${dayjs(date).add(1, 'day').format('YYYY-MM-DD')}T00:00:00.000Z`)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
      setDialogOpen(true)
    } catch (error: any) {
      console.error('Error fetching transactions:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount)
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'success'
      case 'till': return 'info'
      case 'debt': return 'warning'
      default: return 'default'
    }
  }

  const totalStats = summaries.reduce(
    (acc, summary) => ({
      totalSales: acc.totalSales + Number(summary.total_sales),
      totalCash: acc.totalCash + Number(summary.cash_total),
      totalTill: acc.totalTill + Number(summary.till_total),
      totalDebt: acc.totalDebt + Number(summary.debt_total),
    }),
    { totalSales: 0, totalCash: 0, totalTill: 0, totalDebt: 0 }
  )

  if (loading) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading records...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom color="primary">
        Daily Sales Records
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUp color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Total Sales
              </Typography>
            </Box>
            <Typography variant="h6" color="primary">
              {formatCurrency(totalStats.totalSales)}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Receipt color="success" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Cash Total
              </Typography>
            </Box>
            <Typography variant="h6" color="success.main">
              {formatCurrency(totalStats.totalCash)}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccountBalance color="info" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Till Total
              </Typography>
            </Box>
            <Typography variant="h6" color="info.main">
              {formatCurrency(totalStats.totalTill)}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingDown color="warning" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Outstanding Debts
              </Typography>
            </Box>
            <Typography variant="h6" color="warning.main">
              {formatCurrency(totalStats.totalDebt)}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Daily Records Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell align="right">Total Sales</TableCell>
                <TableCell align="right">Cash</TableCell>
                <TableCell align="right">Till</TableCell>
                <TableCell align="right">Debt</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summaries.map((summary) => (
                <TableRow key={summary.id} hover>
                  <TableCell>
                    {dayjs(summary.date).format('MMM DD, YYYY')}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(Number(summary.total_sales))}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={formatCurrency(Number(summary.cash_total))}
                      color="success"
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={formatCurrency(Number(summary.till_total))}
                      color="info"
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={formatCurrency(Number(summary.debt_total))}
                      color="warning"
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      onClick={() => fetchTransactionsForDate(summary.date)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {summaries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">
                      No sales records found. Start making sales to see records here.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Transaction Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent>
          <List>
            {transactions.map((transaction) => (
              <ListItem key={transaction.id} divider>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">
                        {formatCurrency(Number(transaction.amount))}
                      </Typography>
                      <Chip
                        label={transaction.payment_method}
                        color={getPaymentMethodColor(transaction.payment_method) as any}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      {transaction.customer_name && (
                        <Typography variant="body2" color="text.secondary">
                          Customer: {transaction.customer_name}
                        </Typography>
                      )}
                      {transaction.description && (
                        <Typography variant="body2" color="text.secondary">
                          {transaction.description}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(transaction.created_at).format('MMM DD, YYYY HH:mm')}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
            {transactions.length === 0 && (
              <ListItem>
                <ListItemText
                  primary="No transactions found for this date"
                  secondary="This might be because the date has no recorded sales"
                />
              </ListItem>
            )}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default Records
