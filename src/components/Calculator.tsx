
import React, { useState } from 'react'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Divider,
} from '@mui/material'

const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(String(num))
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? String(num) : display + num)
    }
  }

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.')
    }
  }

  const clear = () => {
    setDisplay('0')
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      const newValue = calculate(currentValue, inputValue, operation)

      setDisplay(String(newValue))
      setPreviousValue(newValue)
    }

    setWaitingForOperand(true)
    setOperation(nextOperation)
  }

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue
      case '-':
        return firstValue - secondValue
      case '*':
        return firstValue * secondValue
      case '/':
        return firstValue / secondValue
      case '=':
        return secondValue
      default:
        return secondValue
    }
  }

  const performCalculation = () => {
    const inputValue = parseFloat(display)

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation)
      setDisplay(String(newValue))
      setPreviousValue(null)
      setOperation(null)
      setWaitingForOperand(true)
    }
  }

  const createButton = (label: string, onClick: () => void, variant: 'contained' | 'outlined' = 'outlined') => (
    <Button
      variant={variant}
      onClick={onClick}
      sx={{
        minHeight: 60,
        fontSize: '1.2rem',
        fontWeight: 'bold'
      }}
    >
      {label}
    </Button>
  )

  return (
    <Box sx={{ p: 2, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom color="primary">
        Calculator
      </Typography>

      <Paper sx={{ p: 2 }}>
        <TextField
          fullWidth
          value={display}
          InputProps={{
            readOnly: true,
            sx: {
              fontSize: '2rem',
              textAlign: 'right',
              fontFamily: 'monospace'
            }
          }}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
          {createButton('C', clear, 'contained')}
          {createButton('±', () => setDisplay(String(-parseFloat(display))))}
          {createButton('%', () => setDisplay(String(parseFloat(display) / 100)))}
          {createButton('÷', () => performOperation('/'), 'contained')}

          {createButton('7', () => inputNumber('7'))}
          {createButton('8', () => inputNumber('8'))}
          {createButton('9', () => inputNumber('9'))}
          {createButton('×', () => performOperation('*'), 'contained')}

          {createButton('4', () => inputNumber('4'))}
          {createButton('5', () => inputNumber('5'))}
          {createButton('6', () => inputNumber('6'))}
          {createButton('-', () => performOperation('-'), 'contained')}

          {createButton('1', () => inputNumber('1'))}
          {createButton('2', () => inputNumber('2'))}
          {createButton('3', () => inputNumber('3'))}
          {createButton('+', () => performOperation('+'), 'contained')}

          <Box sx={{ gridColumn: 'span 2' }}>
            {createButton('0', () => inputNumber('0'))}
          </Box>
          {createButton('.', inputDecimal)}
          {createButton('=', performCalculation, 'contained')}
        </Box>
      </Paper>
    </Box>
  )
}

export default Calculator
