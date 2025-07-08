
import React, { useState } from 'react'
import {
  Box,
  Paper,
  Button,
  Typography,
  Grid2 as Grid,
  Alert,
} from '@mui/material'
import { Inventory, Add, Assessment } from '@mui/icons-material'
import { InventoryItem } from './inventory/types'
import InventoryTable from './inventory/InventoryTable'
import AddItemDialog from './inventory/AddItemDialog'
import DailySummaryDialog from './inventory/DailySummaryDialog'
import DailySummaryCard from './inventory/DailySummaryCard'
import { useInventory } from './inventory/useInventory'

const InventoryComponent: React.FC = () => {
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('pieces')
  const [openingStock, setOpeningStock] = useState('')
  const [receivedStock, setReceivedStock] = useState('')
  const [salesStock, setSalesStock] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

  const {
    items,
    dailySummary,
    loading,
    message,
    setMessage,
    setLoading,
    addOrUpdateItem,
    deleteItem,
    saveDailySummary,
  } = useInventory()

  const handleAddItem = async () => {
    if (!itemName || !quantity) return

    const itemData = {
      item_name: itemName,
      quantity: parseInt(quantity),
      unit: unit,
    }

    await addOrUpdateItem(itemData, editingItem)

    setItemName('')
    setQuantity('')
    setUnit('pieces')
    setEditingItem(null)
    setDialogOpen(false)
  }

  const handleDeleteItem = async (id: string) => {
    await deleteItem(id)
  }

  const handleSaveDailySummary = async () => {
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
      opening_stock: openingData,
      received_stock: receivedData,
      sales_stock: salesData,
      closing_stock: closingData,
    }

    await saveDailySummary(summaryData)
    setSummaryDialogOpen(false)
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
        <Grid xs={12}>
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

            <InventoryTable
              items={items}
              onEdit={openEditDialog}
              onDelete={handleDeleteItem}
            />
          </Paper>
        </Grid>

        {dailySummary && (
          <Grid xs={12}>
            <DailySummaryCard dailySummary={dailySummary} />
          </Grid>
        )}
      </Grid>

      <AddItemDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleAddItem}
        editingItem={editingItem}
        itemName={itemName}
        setItemName={setItemName}
        quantity={quantity}
        setQuantity={setQuantity}
        unit={unit}
        setUnit={setUnit}
        loading={loading}
      />

      <DailySummaryDialog
        open={summaryDialogOpen}
        onClose={() => setSummaryDialogOpen(false)}
        onSave={handleSaveDailySummary}
        openingStock={openingStock}
        setOpeningStock={setOpeningStock}
        receivedStock={receivedStock}
        setReceivedStock={setReceivedStock}
        salesStock={salesStock}
        setSalesStock={setSalesStock}
        loading={loading}
      />
    </Box>
  )
}

export default InventoryComponent
