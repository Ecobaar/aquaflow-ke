
import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import dayjs from 'dayjs'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

const Analytics: React.FC = () => {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<any[]>([])
  const [debts, setDebts] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [period, setPeriod] = useState('7days')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, period])

  const fetchData = async () => {
    try {
      const startDate = getStartDate()
      
      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', startDate.toISOString())

      // Fetch debts
      const { data: debtsData } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', startDate.toISOString())

      // Fetch expenses
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', startDate.toISOString())

      setTransactions(transactionsData || [])
      setDebts(debtsData || [])
      setExpenses(expensesData || [])
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStartDate = () => {
    const now = dayjs()
    switch (period) {
      case '7days':
        return now.subtract(7, 'day')
      case '30days':
        return now.subtract(30, 'day')
      case '90days':
        return now.subtract(90, 'day')
      case '1year':
        return now.subtract(1, 'year')
      default:
        return now.subtract(7, 'day')
    }
  }

  // Calculate summary statistics
  const totalSales = transactions.reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalDebt = debts.filter(d => !d.is_paid).reduce((sum, d) => sum + d.amount, 0)
  const netProfit = totalSales - totalExpenses

  // Payment method distribution
  const paymentMethodData = transactions.reduce((acc: any, t) => {
    acc[t.payment_method] = (acc[t.payment_method] || 0) + t.amount
    return acc
  }, {})

  const pieData = Object.entries(paymentMethodData).map(([method, amount]) => ({
    name: method.charAt(0).toUpperCase() + method.slice(1),
    value: amount,
  }))

  // Daily sales trend
  const dailySalesData = transactions.reduce((acc: any, t) => {
    const date = dayjs(t.created_at).format('MMM DD')
    acc[date] = (acc[date] || 0) + t.amount
    return acc
  }, {})

  const salesTrendData = Object.entries(dailySalesData).map(([date, amount]) => ({
    date,
    sales: amount,
  }))

  // Top customers by debt
  const customerDebtData = debts
    .filter(d => !d.is_paid)
    .reduce((acc: any, d) => {
      acc[d.customer_name] = (acc[d.customer_name] || 0) + d.amount
      return acc
    }, {})

  const topDebtorsData = Object.entries(customerDebtData)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a: any, b: any) => b.amount - a.amount)
    .slice(0, 5)

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" color="primary">
          Analytics Dashboard
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Period</InputLabel>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            label="Period"
          >
            <MenuItem value="7days">Last 7 Days</MenuItem>
            <MenuItem value="30days">Last 30 Days</MenuItem>
            <MenuItem value="90days">Last 90 Days</MenuItem>
            <MenuItem value="1year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Sales
            </Typography>
            <Typography variant="h5" color="primary">
              KSh {totalSales.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Expenses
            </Typography>
            <Typography variant="h5" color="error">
              KSh {totalExpenses.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Net Profit
            </Typography>
            <Typography variant="h5" color={netProfit >= 0 ? "success.main" : "error"}>
              KSh {netProfit.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Outstanding Debt
            </Typography>
            <Typography variant="h5" color="warning.main">
              KSh {totalDebt.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mb: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Sales Trend
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `KSh ${value}`} />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Payment Methods
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `KSh ${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Top Debtors
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topDebtorsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `KSh ${value}`} />
            <Legend />
            <Bar dataKey="amount" fill="#ff8042" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  )
}

export default Analytics
