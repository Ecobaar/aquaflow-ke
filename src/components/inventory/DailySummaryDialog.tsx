
import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from '@mui/material'

interface DailySummaryDialogProps {
  open: boolean
  onClose: () => void
  onSave: () => void
  openingStock: string
  setOpeningStock: (value: string) => void
  receivedStock: string
  setReceivedStock: (value: string) => void
  salesStock: string
  setSalesStock: (value: string) => void
  loading: boolean
}

const DailySummaryDialog: React.FC<DailySummaryDialogProps> = ({
  open,
  onClose,
  onSave,
  openingStock,
  setOpeningStock,
  receivedStock,
  setReceivedStock,
  salesStock,
  setSalesStock,
  loading,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Daily Inventory Summary</DialogTitle>
      <DialogContent>
        <Typography variant="body2" gutterBottom>
          Enter inventory data as JSON objects, e.g., {`{"20L_bottles": 50, "bottle_caps": 100}`}
        </Typography>
        <TextField
          fullWidth
          label="Opening Stock"
          multiline
          rows={3}
          value={openingStock}
          onChange={(e) => setOpeningStock(e.target.value)}
          margin="normal"
          placeholder={`{"20L_bottles": 50, "10L_bottles": 30}`}
        />
        <TextField
          fullWidth
          label="Received Stock"
          multiline
          rows={3}
          value={receivedStock}
          onChange={(e) => setReceivedStock(e.target.value)}
          margin="normal"
          placeholder={`{"20L_bottles": 20, "10L_bottles": 15}`}
        />
        <TextField
          fullWidth
          label="Sales Stock"
          multiline
          rows={3}
          value={salesStock}
          onChange={(e) => setSalesStock(e.target.value)}
          margin="normal"
          placeholder={`{"20L_bottles": 35, "10L_bottles": 25}`}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained" disabled={loading}>
          {loading ? 'Saving..' : 'Save Summary'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DailySummaryDialog
