
import React, { useState } from 'react'
import {
  Box,
  Paper,
  TextField,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
} from '@mui/material'

const Calculator: React.FC = () => {
  const [cashInput, setCashInput] = useState('')
  const [tillInput, setTillInput] = useState('')

  const parseValues = (input: string): number[] => {
    if (!input.trim()) return []
    
    return input
      .split(/[,\s+]+/)
      .map(val => val.trim())
      .filter(val => val !== '')
      .map(val => parseFloat(val))
      .filter(val => !isNaN(val))
  }

  const cashValues = parseValues(cashInput)
  const tillValues = parseValues(tillInput)

  const cashTotal = cashValues.reduce((sum, val) => sum + val, 0)
  const tillTotal = tillValues.reduce((sum, val) => sum + val, 0)
  const grandTotal = cashTotal + tillTotal

  const clearAll = () => {
    setCashInput('')
    setTillInput('')
  }

  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom color="primary">
        Cash & Till Calculator
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          label="Cash Values (comma, space, or + separated)"
          value={cashInput}
          onChange={(e) => setCashInput(e.target.value)}
          placeholder="100, 200 + 50"
          margin="normal"
          multiline
          rows={2}
        />

        <TextField
          fullWidth
          label="Till Values (comma, space, or + separated)"
          value={tillInput}
          onChange={(e) => setTillInput(e.target.value)}
          placeholder="1000, 500 + 250"
          margin="normal"
          multiline
          rows={2}
        />

        <Button
          variant="outlined"
          onClick={clearAll}
          sx={{ mt: 2 }}
          fullWidth
        >
          Clear All
        </Button>
      </Paper>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="success.main" gutterBottom>
              Cash Total
            </Typography>
            <Typography variant="h4" color="success.main">
              KSh {cashTotal.toLocaleString()}
            </Typography>
            {cashValues.length > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {cashValues.join(' + ')}
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" color="info.main" gutterBottom>
              Till Total
            </Typography>
            <Typography variant="h4" color="info.main">
              KSh {tillTotal.toLocaleString()}
            </Typography>
            {tillValues.length > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {tillValues.join(' + ')}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      <Paper sx={{ p: 3, mt: 3, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" gutterBottom>
          Grand Total
        </Typography>
        <Typography variant="h3">
          KSh {grandTotal.toLocaleString()}
        </Typography>
      </Paper>
    </Box>
  )
}

export default Calculator
