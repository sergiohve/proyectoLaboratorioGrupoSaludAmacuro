// Servicio de almacenamiento offline para guardar datos cuando no hay internet

interface PendingItem {
  id: string;
  type: 'cliente' | 'examen';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
}

const STORAGE_KEY = 'offline_queue';
const MAX_RETRIES = 3;

class OfflineStorageService {
  // Obtener todos los items pendientes
  getPendingItems(): PendingItem[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Agregar un item a la cola
  addPendingItem(type: 'cliente' | 'examen', action: 'create' | 'update' | 'delete', data: any): string {
    const items = this.getPendingItems();
    const id = `${type}_${action}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newItem: PendingItem = {
      id,
      type,
      action,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    items.push(newItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

    console.log(`✅ [OFFLINE] Guardado en cola: ${type} - ${action}`, data);
    return id;
  }

  // Remover un item de la cola
  removePendingItem(id: string): void {
    const items = this.getPendingItems();
    const filtered = items.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    console.log(`🗑️ [OFFLINE] Removido de cola: ${id}`);
  }

  // Incrementar reintentos
  incrementRetries(id: string): void {
    const items = this.getPendingItems();
    const item = items.find(i => i.id === id);
    if (item) {
      item.retries += 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }

  // Verificar si ha excedido reintentos
  hasExceededRetries(id: string): boolean {
    const items = this.getPendingItems();
    const item = items.find(i => i.id === id);
    return item ? item.retries >= MAX_RETRIES : false;
  }

  // Limpiar toda la cola
  clearQueue(): void {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🧹 [OFFLINE] Cola limpiada');
  }

  // Obtener cantidad de items pendientes
  getPendingCount(): number {
    return this.getPendingItems().length;
  }

  // Guardar datos en cache para lectura offline
  cacheData(key: string, data: any): void {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error al cachear datos:', error);
    }
  }

  // Obtener datos del cache
  getCachedData(key: string): any {
    try {
      const data = localStorage.getItem(`cache_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error al obtener cache:', error);
      return null;
    }
  }
}

export const offlineStorage = new OfflineStorageService();
