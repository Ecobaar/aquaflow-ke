
import React from 'react'
import { Card, CardContent, Typography, Grid2 as Grid } from '@mui/material'
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
        <Grid container spacing={2}>
          <Grid xs={3}>
            <Typography variant="body2" color="textSecondary">Opening Stock</Typography>
            <Typography variant="body1">
              {JSON.stringify(dailySummary.opening_stock)}
            </Typography>
          </Grid>
          <Grid xs={3}>
            <Typography variant="body2" color="textSecondary">Received</Typography>
            <Typography variant="body1">
              {JSON.stringify(dailySummary.received_stock)}
            </Typography>
          </Grid>
          <Grid xs={3}>
            <Typography variant="body2" color="textSecondary">Sales</Typography>
            <Typography variant="body1">
              {JSON.stringify(dailySummary.sales_stock)}
            </Typography>
          </Grid>
          <Grid xs={3}>
            <Typography variant="body2" color="textSecondary">Closing Stock</Typography>
            <Typography variant="body1">
              {JSON.stringify(dailySummary.closing_stock)}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default DailySummaryCard
