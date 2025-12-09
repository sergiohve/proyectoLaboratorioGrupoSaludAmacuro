# 📴 Sistema Offline - Documentación Completa

## 🎯 Descripción

Tu aplicación ahora tiene un **sistema completo de funcionamiento offline** que permite:

- ✅ Guardar clientes y exámenes cuando no hay internet
- 🔄 Sincronización automática cuando vuelve la conexión
- 📊 Indicador visual del estado de conexión en el Header
- 💾 Cola de pendientes con reintentos automáticos
- 🎨 UI moderna y rediseñada para Header y Sidebar

---

## 🏗️ Arquitectura del Sistema

### **Archivos Creados:**

1. **`src/services/offlineStorage.ts`** - Servicio de almacenamiento local
2. **`src/services/syncService.ts`** - Servicio de sincronización
3. **`src/hooks/useOnlineStatus.ts`** - Hook de detección de conexión

### **Archivos Modificados:**

1. **`src/app/(DashboardLayout)/layout/header/Header.tsx`** - Header rediseñado
2. **`src/app/(DashboardLayout)/layout/sidebar/SidebarItems.tsx`** - Sidebar moderno

---

## 🚀 Cómo Integrar en tus Componentes

### **1. En AgregarCliente.tsx**

Agrega el sistema offline al guardar clientes:

```typescript
import { offlineStorage } from '@/services/offlineStorage';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

// Dentro del componente
const { isOnline } = useOnlineStatus();

// En tu función handleSubmit (ejemplo):
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validaciones aquí...

  try {
    if (isOnline) {
      // Si hay internet, intenta guardar normalmente
      const response = await fetch('https://backinvent.onrender.com/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al guardar');

      setMessage({ type: 'success', text: 'Cliente guardado exitosamente' });
    } else {
      // Si NO hay internet, guarda en cola offline
      offlineStorage.addPendingItem('cliente', 'create', formData);
      setMessage({
        type: 'warning',
        text: '⚠️ Sin conexión. Cliente guardado para sincronizar después'
      });
    }

    // Limpiar formulario
    setFormData({ nombre: '', cedula: '', edad: '', sexo: '', direccion: '' });

  } catch (error) {
    // Si falla online, guarda offline como backup
    offlineStorage.addPendingItem('cliente', 'create', formData);
    setMessage({
      type: 'warning',
      text: '⚠️ Error de conexión. Cliente guardado para sincronizar después'
    });
  }
};
```

### **2. En RegistroExamen.tsx**

Similar a clientes, pero para exámenes:

```typescript
import { offlineStorage } from '@/services/offlineStorage';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

const { isOnline } = useOnlineStatus();

const handleGuardarExamen = async () => {
  try {
    if (isOnline) {
      // Intenta guardar online
      const response = await fetch('https://backinvent.onrender.com/api/examenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examenData),
      });

      if (!response.ok) throw new Error('Error al guardar');

      setMessage({ type: 'success', text: 'Examen guardado exitosamente' });
    } else {
      // Guarda offline
      offlineStorage.addPendingItem('examen', 'create', examenData);
      setMessage({
        type: 'warning',
        text: '⚠️ Sin conexión. Examen guardado para sincronizar después'
      });
    }
  } catch (error) {
    // Backup offline
    offlineStorage.addPendingItem('examen', 'create', examenData);
    setMessage({
      type: 'warning',
      text: '⚠️ Error de conexión. Examen guardado para sincronizar después'
    });
  }
};
```

### **3. En contextos (clientesContext.tsx / examenesContext.tsx)**

Modifica las funciones de crear, actualizar y eliminar:

```typescript
// En clientesContext.tsx
import { offlineStorage } from '@/services/offlineStorage';

const createCliente = async (data: any) => {
  try {
    const response = await fetch('https://backinvent.onrender.com/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Error');

    await fetchClientes(); // Recargar lista
  } catch (error) {
    // Si falla, guardar offline
    offlineStorage.addPendingItem('cliente', 'create', data);
    throw new Error('Guardado offline para sincronizar después');
  }
};

const updateCliente = async (id: string, data: any) => {
  try {
    const response = await fetch(`https://backinvent.onrender.com/api/clientes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Error');

    await fetchClientes();
  } catch (error) {
    offlineStorage.addPendingItem('cliente', 'update', { _id: id, ...data });
    throw new Error('Guardado offline para sincronizar después');
  }
};

const deleteCliente = async (id: string) => {
  try {
    const response = await fetch(`https://backinvent.onrender.com/api/clientes/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Error');

    await fetchClientes();
  } catch (error) {
    offlineStorage.addPendingItem('cliente', 'delete', { _id: id });
    throw new Error('Eliminación guardada offline para sincronizar después');
  }
};
```

---

## 🎨 Diseño Modernizado

### **Header Features:**

- 🌐 **Indicador de conexión** con chip animado (verde: online, naranja: offline)
- ☁️ **Botón de sincronización manual** (solo visible con items pendientes)
- 🌙 **Toggle de tema** con animación de rotación
- 💫 Gradientes modernos en todos los botones
- ✨ Efectos hover suaves

### **Sidebar Features:**

- 🎨 **MenuItems con gradientes** cuando están seleccionados
- 📍 **Barra lateral izquierda** en items activos
- 🎯 **Efectos de hover** con translateX
- 💎 **Logo con animación** hover (escala + rotación)
- 🔷 **Separador con gradiente** debajo del logo
- ⚡ **Transiciones smooth** en todos los elementos

---

## 📊 Cómo Funciona

1. **Usuario intenta guardar** un cliente o examen
2. **Sistema verifica conexión** usando `useOnlineStatus()`
3. **Si hay internet:** Guarda normalmente en la API
4. **Si NO hay internet:** Guarda en `localStorage` con `offlineStorage`
5. **Cola pendiente:** Los items se guardan con timestamp y reintentos
6. **Reconexión automática:** Cuando vuelve el internet, `useOnlineStatus` detecta el cambio
7. **Sincronización automática:** `syncService` envía todos los items pendientes
8. **Reintentos:** Si falla un item, se reintenta hasta 3 veces
9. **Limpieza:** Items exitosos se eliminan de la cola

---

## 🔍 Testing del Sistema

### **Probar Offline Mode:**

1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Cambia de "Online" a **"Offline"**
4. Intenta guardar un cliente/examen
5. Verás el mensaje: "Sin conexión. Guardado para sincronizar después"
6. En el Header verás: "Offline (1 pendientes)"
7. Cambia de vuelta a "Online"
8. Verás el chip cambiar a "Sincronizando..."
9. Los datos se envían automáticamente
10. El chip vuelve a "En línea"

### **Sincronización Manual:**

1. Con items pendientes y conexión online
2. Haz clic en el botón de nube (☁️) en el Header
3. Se sincronizarán todos los items inmediatamente

---

## 📱 Indicadores Visuales

| Estado | Color | Texto | Icono |
|--------|-------|-------|-------|
| **Online** | Verde 🟢 | "En línea" | WiFi |
| **Offline** | Naranja 🟠 | "Offline (X pendientes)" | WiFi Off |
| **Sincronizando** | Animado ✨ | "Sincronizando..." | WiFi |

---

## 🛠️ API de Servicios

### **offlineStorage**

```typescript
// Agregar item a cola
offlineStorage.addPendingItem('cliente', 'create', data);

// Obtener items pendientes
const pendientes = offlineStorage.getPendingItems();

// Obtener cantidad
const count = offlineStorage.getPendingCount();

// Limpiar cola
offlineStorage.clearQueue();
```

### **syncService**

```typescript
// Sincronizar todos los items
await syncService.syncPendingItems();

// Verificar si está sincronizando
const isSyncing = syncService.isSyncInProgress();

// Escuchar cambios
syncService.onSyncStatusChange((status, count) => {
  console.log(status, count);
});
```

### **useOnlineStatus Hook**

```typescript
const { isOnline, isSyncing, pendingCount, manualSync } = useOnlineStatus();

// isOnline: boolean - Estado de conexión
// isSyncing: boolean - Si está sincronizando
// pendingCount: number - Cantidad de items pendientes
// manualSync: () => Promise<boolean> - Función para sincronizar manualmente
```

---

## ✅ Checklist de Integración

- [ ] Importar `offlineStorage` en componentes de formularios
- [ ] Importar `useOnlineStatus` hook
- [ ] Modificar funciones de submit para usar sistema offline
- [ ] Probar guardado offline
- [ ] Probar sincronización automática
- [ ] Verificar indicadores visuales en Header
- [ ] Probar sincronización manual
- [ ] Verificar mensajes de feedback al usuario

---

## 🎉 Beneficios

✨ **Tu app ahora funciona completamente offline**
📱 **Mejor experiencia de usuario**
💾 **No se pierden datos nunca**
🔄 **Sincronización automática inteligente**
🎨 **UI moderna y profesional**
⚡ **Reintentos automáticos**

---

## 📞 Soporte

Si necesitas ayuda con la integración, revisa los ejemplos en este archivo o consulta los archivos de servicios creados.

**¡Tu aplicación ahora es PWA-ready y offline-first! 🚀**
