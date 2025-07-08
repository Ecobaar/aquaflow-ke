
import React, { useState, useEffect } from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { Inventory, Add, Edit, Delete, Assessment } from '@mui/icons-material'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../contexts/AuthContext'

interface InventoryItem {
  id: string
  item_name: string
  quantity: number
  unit: string
  date: string
  created_at: string
}

interface DailyInventorySummary {
  date: string
  opening_stock: any
  received_stock: any
  sales_stock: any
  closing_stock: any
}

const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [dailySummary, setDailySummary] = useState<DailyInventorySummary | null>(null)
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('pieces')
  const [openingStock, setOpeningStock] = useState('')
  const [receivedStock, setReceivedStock] = useState('')
  const [salesStock, setSalesStock] = useState('')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchItems()
      fetchDailySummary()
    }
  }, [user])

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (error: any) {
      console.error('Error fetching inventory:', error)
      setMessage({ type: 'error', text: 'Failed to fetch inventory items' })
    }
  }

  const fetchDailySummary = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('daily_inventory_summary')
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', today)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setDailySummary(data)
    } catch (error: any) {
      console.error('Error fetching daily summary:', error)
    }
  }

  const handleAddItem = async () => {
    if (!itemName || !quantity) return

    setLoading(true)
    setMessage(null)

    try {
      const itemData = {
        user_id: user?.id!,
        item_name: itemName,
        quantity: parseInt(quantity),
        unit: unit,
        date: new Date().toISOString().split('T')[0]
      }

      if (editingItem) {
        const { error } = await supabase
          .from('inventory')
          .update(itemData)
          .eq('id', editingItem.id)

        if (error) throw error
        setMessage({ type: 'success', text: 'Item updated successfully!' })
      } else {
        const { error } = await supabase
          .from('inventory')
          .insert(itemData)

        if (error) throw error
        setMessage({ type: 'success', text: 'Item added successfully!' })
      }

      setItemName('')
      setQuantity('')
      setUnit('pieces')
      setEditingItem(null)
      setDialogOpen(false)
      fetchItems()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id)

      if (error) throw error
      setMessage({ type: 'success', text: 'Item deleted successfully!' })
      fetchItems()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  const handleSaveDailySummary = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const today = new Date().toISOString().split('T')[0]
      const openingData = openingStock ? JSON.parse(openingStock) : {}
      const receivedData = receivedStock ? JSON.parse(receivedStock) : {}
      const salesData = salesStock ? JSON.parse(salesStock) : {}
      
      // Calculate closing stock
      const closingData: any = {}
      Object.keys(openingData).forEach(key => {
        const opening = openingData[key] || 0
        const received = receivedData[key] || 0
        const sales = salesData[key] || 0
        closingData[key] = opening + received - sales
      })

      const summaryData = {
        user_id: user?.id!,
        date: today,
        opening_stock: openingData,
        received_stock: receivedData,
        sales_stock: salesData,
        closing_stock: closingData,
        updated_at: new Date().toISOString()
      }

      if (dailySummary) {
        const { error } = await supabase
          .from('daily_inventory_summary')
          .update(summaryData)
          .eq('user_id', user?.id)
          .eq('date', today)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('daily_inventory_summary')
          .insert(summaryData)

        if (error) throw error
      }

      setMessage({ type: 'success', text: 'Daily summary saved successfully!' })
      setSummaryDialogOpen(false)
      fetchDailySummary()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item)
    setItemName(item.item_name)
    setQuantity(item.quantity.toString())
    setUnit(item.unit)
    setDialogOpen(true)
  }

  const openAddDialog = () => {
    setEditingItem(null)
    setItemName('')
    setQuantity('')
    setUnit('pieces')
    setDialogOpen(true)
  }

  return (
    <Box sx={{ p: 2, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Inventory />
        Inventory Management
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Inventory Items</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={openAddDialog}
                >
                  Add Item
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Assessment />}
                  onClick={() => setSummaryDialogOpen(true)}
                >
                  Daily Summary
                </Button>
              </Box>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item Name</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.item_name}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                      <TableCell align="center">
                        <IconButton onClick={() => openEditDialog(item)} size="small">
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteItem(item.id)} size="small" color="error">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No inventory items found. Add some items to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {dailySummary && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Today's Inventory Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="textSecondary">Opening Stock</Typography>
                    <Typography variant="body1">
                      {JSON.stringify(dailySummary.opening_stock)}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="textSecondary">Received</Typography>
                    <Typography variant="body1">
                      {JSON.stringify(dailySummary.received_stock)}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="textSecondary">Sales</Typography>
                    <Typography variant="body1">
                      {JSON.stringify(dailySummary.sales_stock)}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="textSecondary">Closing Stock</Typography>
                    <Typography variant="body1">
                      {JSON.stringify(dailySummary.closing_stock)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Add/Edit Item Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            margin="normal"
            placeholder="e.g., Empty 20L bottles, Bottle caps"
          />
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Unit</InputLabel>
            <Select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              label="Unit"
            >
              <MenuItem value="pieces">Pieces</MenuItem>
              <MenuItem value="liters">Liters</MenuItem>
              <MenuItem value="kg">Kilograms</MenuItem>
              <MenuItem value="boxes">Boxes</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddItem} variant="contained" disabled={loading}>
            {loading ? 'Saving...' : (editingItem ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Daily Summary Dialog */}
      <Dialog open={summaryDialogOpen} onClose={() => setSummaryDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Daily Inventory Summary</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Enter inventory data as JSON objects, e.g., {"20L_bottles": 50, "bottle_caps": 100}
          </Typography>
          <TextField
            fullWidth
            label="Opening Stock"
            multiline
            rows={3}
            value={openingStock}
            onChange={(e) => setOpeningStock(e.target.value)}
            margin="normal"
            placeholder='{"20L_bottles": 50, "10L_bottles": 30}'
          />
          <TextField
            fullWidth
            label="Received Stock"
            multiline
            rows={3}
            value={receivedStock}
            onChange={(e) => setReceivedStock(e.target.value)}
            margin="normal"
            placeholder='{"20L_bottles": 20, "10L_bottles": 15}'
          />
          <TextField
            fullWidth
            label="Sales Stock"
            multiline
            rows={3}
            value={salesStock}
            onChange={(e) => setSalesStock(e.target.value)}
            margin="normal"
            placeholder='{"20L_bottles": 35, "10L_bottles": 25}'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSummaryDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveDailySummary} variant="contained" disabled={loading}>
            {loading ? 'Saving...' : 'Save Summary'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Inventory
