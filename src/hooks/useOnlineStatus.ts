// Hook para detectar estado de conexión y sincronizar automáticamente

import { useState, useEffect } from 'react';
import { syncService } from '@/services/syncService';
import { offlineStorage } from '@/services/offlineStorage';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Inicializar estado
    setIsOnline(navigator.onLine);
    updatePendingCount();

    // Handlers para cambios de conexión
    const handleOnline = async () => {
      console.log('🌐 [ONLINE] Conexión restaurada');
      setIsOnline(true);

      // Sincronizar automáticamente cuando vuelve la conexión
      const pending = offlineStorage.getPendingCount();
      if (pending > 0) {
        console.log(`🔄 [ONLINE] Sincronizando ${pending} items pendientes...`);
        setIsSyncing(true);
        try {
          await syncService.syncPendingItems();
          updatePendingCount();
        } catch (error) {
          console.error('Error al sincronizar:', error);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    const handleOffline = () => {
      console.log('📴 [OFFLINE] Conexión perdida');
      setIsOnline(false);
    };

    // Agregar event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Suscribirse a cambios en la cola
    const interval = setInterval(updatePendingCount, 1000);

    // Suscribirse a eventos de sincronización
    const unsubscribe = syncService.onSyncStatusChange((status, count) => {
      if (status === 'syncing') {
        setIsSyncing(true);
      } else {
        setIsSyncing(false);
        updatePendingCount();
      }
    });

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const updatePendingCount = () => {
    setPendingCount(offlineStorage.getPendingCount());
  };

  const manualSync = async () => {
    if (!isOnline) {
      console.warn('⚠️ No hay conexión para sincronizar');
      return false;
    }

    setIsSyncing(true);
    try {
      const result = await syncService.syncPendingItems();
      updatePendingCount();
      return result;
    } catch (error) {
      console.error('Error en sincronización manual:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    isSyncing,
    pendingCount,
    manualSync,
  };
};
