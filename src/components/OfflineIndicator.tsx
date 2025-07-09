
import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { WifiOff, Wifi, Clock } from '@mui/icons-material';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, pendingOperations, isSyncing } = useOfflineSync();

  if (isOnline && pendingOperations.length === 0) {
    return null;
  }

  return (
    <Box sx={{ position: 'fixed', top: 70, right: 16, zIndex: 1000 }}>
      {!isOnline && (
        <Chip
          icon={<WifiOff />}
          label="Offline"
          color="warning"
          variant="filled"
          sx={{ mb: 1 }}
        />
      )}
      {pendingOperations.length > 0 && (
        <Chip
          icon={isSyncing ? <Clock /> : <Clock />}
          label={`${pendingOperations.length} pending sync${isSyncing ? ' (syncing...)' : ''}`}
          color={isSyncing ? "info" : "default"}
          variant="outlined"
        />
      )}
    </Box>
  );
};
