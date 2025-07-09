
import React from 'react'
import { Card, CardContent, Typography, Box } from '@mui/material'
import { DailyInventorySummary } from './types'

interface DailySummaryCardProps {
  dailySummary: DailyInventorySummary
}

const DailySummaryCard: React.FC<DailySummaryCardProps> = ({ dailySummary }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Today's Inventory Summary
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="textSecondary">Opening Stock</Typography>
            <Typography variant="body1">
              {JSON.stringify(dailySummary.opening_stock)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">Received</Typography>
            <Typography variant="body1">
              {JSON.stringify(dailySummary.received_stock)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">Sales</Typography>
            <Typography variant="body1">
              {JSON.stringify(dailySummary.sales_stock)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">Closing Stock</Typography>
            <Typography variant="body1">
              {JSON.stringify(dailySummary.closing_stock)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default DailySummaryCard
