
import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { InventoryItem } from './types'

interface AddItemDialogProps {
  open: boolean
  onClose: () => void
  onSave: () => void
  editingItem: InventoryItem | null
  itemName: string
  setItemName: (value: string) => void
  quantity: string
  setQuantity: (value: string) => void
  unit: string
  setUnit: (value: string) => void
  loading: boolean
}

const AddItemDialog: React.FC<AddItemDialogProps> = ({
  open,
  onClose,
  onSave,
  editingItem,
  itemName,
  setItemName,
  quantity,
  setQuantity,
  unit,
  setUnit,
  loading,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained" disabled={loading}>
          {loading ? 'Saving...' : (editingItem ? 'Update' : 'Add')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddItemDialog
