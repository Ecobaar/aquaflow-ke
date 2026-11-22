
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type TableName = 'transactions' | 'customers' | 'debts' | 'expenses' | 'inventory' | 'daily_summaries';

interface PendingOperation {
  id: string;
  table: TableName;
  operation: 'insert' | 'update' | 'delete';
  data: Record<string, unknown> & { id?: string | number };
  timestamp: Date;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingOperations, setPendingOperations] = useState<PendingOperation[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending operations from localStorage
    const stored = localStorage.getItem('pendingOperations');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPendingOperations(parsed.map((op: PendingOperation) => ({
          ...op,
          timestamp: new Date(op.timestamp)
        })));
      } catch (error) {
        console.error('Failed to parse pending operations:', error);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('pendingOperations', JSON.stringify(pendingOperations));
  }, [pendingOperations]);

  useEffect(() => {
    if (isOnline && pendingOperations.length > 0) {
      syncPendingOperations();
    }
  }, [isOnline]);

  const addPendingOperation = useCallback((operation: Omit<PendingOperation, 'id' | 'timestamp'>) => {
    const newOperation: PendingOperation = {
      ...operation,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setPendingOperations(prev => [...prev, newOperation]);
  }, []);

  const syncPendingOperations = useCallback(async () => {
    if (isSyncing || pendingOperations.length === 0) return;

    setIsSyncing(true);
    const successful: string[] = [];

    for (const operation of pendingOperations) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const table = supabase.from(operation.table) as any;
        let result: { error: unknown } | undefined;
        switch (operation.operation) {
          case 'insert':
            result = await table.insert(operation.data);
            break;
          case 'update':
            result = await table.update(operation.data).eq('id', operation.data.id);
            break;
          case 'delete':
            result = await table.delete().eq('id', operation.data.id);
            break;
        }
        if (result?.error) throw result.error;
        successful.push(operation.id);
      } catch (error) {
        console.error(`Failed to sync operation ${operation.id}:`, error);
      }
    }

    // Remove successful operations
    setPendingOperations(prev => prev.filter(op => !successful.includes(op.id)));
    setIsSyncing(false);
  }, [pendingOperations, isSyncing]);

  return {
    isOnline,
    pendingOperations,
    isSyncing,
    addPendingOperation,
    syncPendingOperations
  };
};
