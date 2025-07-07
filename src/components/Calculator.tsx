
import React, { useState } from 'react'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
} from '@mui/material'
import { Calculate, Add, Remove } from '@mui/icons-material'

const Calculator: React.FC = () => {
  const [pricePerLiter, setPricePerLiter] = useState<number>(5)
  const [liters, setLiters] = useState<number>(0)
  const [total, setTotal] = useState<number>(0)

  const calculateTotal = () => {
    const calculatedTotal = pricePerLiter * liters
    setTotal(calculatedTotal)
  }

  const addLiter = () => {
    const newLiters = liters + 1
    setLiters(newLiters)
    setTotal(pricePerLiter * newLiters)
  }

  const removeLiter = () => {
    if (liters > 0) {
      const newLiters = liters - 1
      setLiters(newLiters)
      setTotal(pricePerLiter * newLiters)
    }
  }

  const reset = () => {
    setLiters(0)
    setTotal(0)
  }

  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Calculate />
        Water Calculator
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Price per Liter (KSh)"
              type="number"
              value={pricePerLiter}
              onChange={(e) => setPricePerLiter(Number(e.target.value) || 0)}
              inputProps={{ min: 0, step: 0.5 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={removeLiter}
                disabled={liters <= 0}
                sx={{ minWidth: 50 }}
              >
                <Remove />
              </Button>
              
              <TextField
                label="Liters"
                type="number"
                value={liters}
                onChange={(e) => setLiters(Number(e.target.value) || 0)}
                inputProps={{ min: 0, step: 0.5 }}
                sx={{ flex: 1 }}
              />
              
              <Button
                variant="outlined"
                onClick={addLiter}
                sx={{ minWidth: 50 }}
              >
                <Add />
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={calculateTotal}
                fullWidth
                size="large"
              >
                Calculate
              </Button>
              <Button
                variant="outlined"
                onClick={reset}
                fullWidth
                size="large"
              >
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Total Amount
          </Typography>
          <Typography variant="h3" component="div">
            KSh {total.toFixed(2)}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            {liters} liters × KSh {pricePerLiter}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Calculator
