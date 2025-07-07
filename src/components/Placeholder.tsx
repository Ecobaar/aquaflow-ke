
import React from 'react'
import { Box, Paper, Typography, Card, CardContent } from '@mui/material'
import { Construction } from '@mui/icons-material'

interface PlaceholderProps {
  title: string
  description?: string
}

const Placeholder: React.FC<PlaceholderProps> = ({ title, description }) => {
  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Construction sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            {title}
          </Typography>
          {description && (
            <Typography variant="body1" color="text.secondary">
              {description}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This feature is coming soon!
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Placeholder
