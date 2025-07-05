
import React from 'react'
import { Box, Typography, Paper } from '@mui/material'

interface PlaceholderProps {
  title: string
  description: string
}

const Placeholder: React.FC<PlaceholderProps> = ({ title, description }) => {
  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom color="primary">
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      </Paper>
    </Box>
  )
}

export default Placeholder
