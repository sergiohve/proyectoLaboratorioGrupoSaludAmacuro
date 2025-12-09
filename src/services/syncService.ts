// Servicio de sincronización para enviar datos pendientes cuando vuelve el internet

import { offlineStorage } from './offlineStorage';

const API_BASE_URL = 'https://backinvent.onrender.com/api';

class SyncService {
  private isSyncing = false;
  private syncListeners: Array<(status: 'syncing' | 'success' | 'error', count?: number) => void> = [];

  // Suscribirse a eventos de sincronización
  onSyncStatusChange(callback: (status: 'syncing' | 'success' | 'error', count?: number) => void) {
    this.syncListeners.push(callback);
    return () => {
      this.syncListeners = this.syncListeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(status: 'syncing' | 'success' | 'error', count?: number) {
    this.syncListeners.forEach(callback => callback(status, count));
  }

  // Sincronizar todos los items pendientes
  async syncPendingItems(): Promise<boolean> {
    if (this.isSyncing) {
      console.log('⏳ [SYNC] Ya hay una sincronización en curso');
      return false;
    }

    const pendingItems = offlineStorage.getPendingItems();

    if (pendingItems.length === 0) {
      console.log('✅ [SYNC] No hay items pendientes para sincronizar');
      return true;
    }

    this.isSyncing = true;
    this.notifyListeners('syncing', pendingItems.length);
    console.log(`🔄 [SYNC] Iniciando sincronización de ${pendingItems.length} items...`);

    let successCount = 0;
    let errorCount = 0;

    for (const item of pendingItems) {
      try {
        await this.syncSingleItem(item);
        offlineStorage.removePendingItem(item.id);
        successCount++;
        console.log(`✅ [SYNC] Item sincronizado: ${item.type} - ${item.action}`);
      } catch (error) {
        errorCount++;
        offlineStorage.incrementRetries(item.id);

        if (offlineStorage.hasExceededRetries(item.id)) {
          console.error(`❌ [SYNC] Item excedió reintentos, removiendo: ${item.id}`);
          offlineStorage.removePendingItem(item.id);
        } else {
          console.error(`⚠️ [SYNC] Error al sincronizar item (reintento ${item.retries + 1}):`, error);
        }
      }
    }

    this.isSyncing = false;

    if (errorCount === 0) {
      console.log(`🎉 [SYNC] Sincronización completada exitosamente (${successCount} items)`);
      this.notifyListeners('success', successCount);
      return true;
    } else {
      console.log(`⚠️ [SYNC] Sincronización completada con errores (${successCount} éxitos, ${errorCount} errores)`);
      this.notifyListeners('error', errorCount);
      return false;
    }
  }

  // Sincronizar un item individual
  private async syncSingleItem(item: any): Promise<void> {
    const { type, action, data } = item;

    if (type === 'cliente') {
      await this.syncCliente(action, data);
    } else if (type === 'examen') {
      await this.syncExamen(action, data);
    }
  }

  // Sincronizar cliente
  private async syncCliente(action: string, data: any): Promise<void> {
    const url = action === 'create'
      ? `${API_BASE_URL}/clientes`
      : action === 'update'
      ? `${API_BASE_URL}/clientes/${data._id}`
      : `${API_BASE_URL}/clientes/${data._id}`;

    const method = action === 'create' ? 'POST' : action === 'update' ? 'PUT' : 'DELETE';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: method !== 'DELETE' ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  // Sincronizar examen
  private async syncExamen(action: string, data: any): Promise<void> {
    const url = action === 'create'
      ? `${API_BASE_URL}/examenes`
      : action === 'update'
      ? `${API_BASE_URL}/examenes/${data._id}`
      : `${API_BASE_URL}/examenes/${data._id}`;

    const method = action === 'create' ? 'POST' : action === 'update' ? 'PUT' : 'DELETE';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: method !== 'DELETE' ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  // Verificar si hay sincronización en curso
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }
}

export const syncService = new SyncService();
