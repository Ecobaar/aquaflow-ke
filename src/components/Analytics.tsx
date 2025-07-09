
import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../contexts/AuthContext'
import dayjs from 'dayjs'

interface AnalyticsData {
  dailySales: any[]
  paymentMethodBreakdown: any[]
  monthlyTrends: any[]
  totalRevenue: number
  totalTransactions: number
  avgTransactionValue: number
}

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchAnalytics()
    }
  }, [user, timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const endDate = new Date()
      const startDate = new Date()
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(endDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(endDate.getDate() - 90)
          break
      }

      // Fetch transactions
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true })

      if (transError) throw transError

      // Process data for charts
      const processedData = processAnalyticsData(transactions || [])
      setData(processedData)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const processAnalyticsData = (transactions: any[]): AnalyticsData => {
    // Daily sales data
    const dailySalesMap = new Map()
    transactions.forEach(transaction => {
      const date = dayjs(transaction.created_at).format('MMM DD')
      const existing = dailySalesMap.get(date) || 0
      dailySalesMap.set(date, existing + transaction.amount)
    })
    
    const dailySales = Array.from(dailySalesMap.entries()).map(([date, amount]) => ({
      date,
      amount
    }))

    // Payment method breakdown
    const paymentMethodMap = new Map()
    transactions.forEach(transaction => {
      const method = transaction.payment_method
      const existing = paymentMethodMap.get(method) || 0
      paymentMethodMap.set(method, existing + transaction.amount)
    })

    const paymentMethodBreakdown = Array.from(paymentMethodMap.entries()).map(([method, amount]) => ({
      method,
      amount
    }))

    // Calculate totals
    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0)
    const totalTransactions = transactions.length
    const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    return {
      dailySales,
      paymentMethodBreakdown,
      monthlyTrends: dailySales, // Simplified for now
      totalRevenue,
      totalTransactions,
      avgTransactionValue
    }
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300']

  if (loading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography>Loading analytics...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" color="primary">
          Station Analytics
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            label="Time Range"
          >
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="90d">Last 90 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                Total Revenue
              </Typography>
              <Typography variant="h4" color="primary">
                KSh {data?.totalRevenue.toLocaleString() || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                Total Transactions
              </Typography>
              <Typography variant="h4" color="primary">
                {data?.totalTransactions || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                Avg Transaction
              </Typography>
              <Typography variant="h4" color="primary">
                KSh {data?.avgTransactionValue.toFixed(0) || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Daily Sales Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.dailySales || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`KSh ${Number(value).toLocaleString()}`, 'Sales']} />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Payment Methods
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.paymentMethodBreakdown || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {data?.paymentMethodBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`KSh ${Number(value).toLocaleString()}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Analytics
