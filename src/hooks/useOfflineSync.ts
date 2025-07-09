
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type TableName = 'transactions' | 'customers' | 'debts' | 'expenses' | 'inventory' | 'daily_summaries';

interface PendingOperation {
  id: string;
  table: TableName;
  operation: 'insert' | 'update' | 'delete';
  data: any;
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
        setPendingOperations(parsed.map((op: any) => ({
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
        switch (operation.operation) {
          case 'insert':
            await (supabase.from as any)(operation.table).insert(operation.data);
            break;
          case 'update':
            await (supabase.from as any)(operation.table).update(operation.data).eq('id', operation.data.id);
            break;
          case 'delete':
            await (supabase.from as any)(operation.table).delete().eq('id', operation.data.id);
            break;
        }
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
