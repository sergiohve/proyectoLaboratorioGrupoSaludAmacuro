"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface Cliente {
  _id: string;
  nombre: string;
  cedula: string;
  edad: number;
  sexo: string;
  fecha: string;
  createdAt: string;
}

interface ClientesContextType {
  clientes: Cliente[];
  loading: boolean;
  error: string | null;
  refreshClientes: () => Promise<void>;
  addCliente: (cliente: Omit<Cliente, "_id" | "createdAt">) => Promise<void>;
  deleteCliente: (id: string) => Promise<void>;
  updateCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>;
  stats: {
    totalClientes: number;
    nuevosHoy: number;
    clientesActivos: number;
    registrosMes: number;
  };
}

const ClientesContext = createContext<ClientesContextType | undefined>(
  undefined
);

// Función para convertir a hora de Venezuela (UTC-4)
const toVenezuelaTime = (date: Date): Date => {
  // Venezuela está en UTC-4, así que restamos 4 horas del offset
  const venezuelaOffset = -4 * 60; // -4 horas en minutos
  return new Date(date.getTime() + (date.getTimezoneOffset() - venezuelaOffset) * 60000);
};

// Función para obtener fecha actual en Venezuela (sin horas)
const getTodayVenezuela = (): Date => {
  const now = new Date();
  const venezuelaTime = toVenezuelaTime(now);
  venezuelaTime.setHours(0, 0, 0, 0);
  return venezuelaTime;
};

// Función para obtener inicio del mes en Venezuela
const getStartOfMonthVenezuela = (): Date => {
  const today = getTodayVenezuela();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);
  return startOfMonth;
};

// Función para convertir fecha del cliente a hora de Venezuela
const parseClienteDate = (dateString: string): Date => {
  const date = new Date(dateString);
  return toVenezuelaTime(date);
};

export const ClientesProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("https://backinvent.onrender.com/api/clientes");
      if (!response.ok) throw new Error("Error al cargar clientes");
      const data = await response.json();
      setClientes(data);
      console.log("Clientes cargados:", data);
    } catch (err) {
      setError("Error al cargar los clientes");
      console.error("Error fetching clientes:", err);
    } finally {
      setLoading(false);
    }
  };

  const addCliente = async (
    clienteData: Omit<Cliente, "_id" | "createdAt">
  ) => {
    try {
      const response = await fetch("https://backinvent.onrender.com/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clienteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear cliente");
      }

      await fetchClientes(); // Refrescar la lista
    } catch (error) {
      throw error;
    }
  };

  const deleteCliente = async (id: string) => {
    try {
      const response = await fetch(`https://backinvent.onrender.com/api/clientes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar cliente");

      await fetchClientes(); // Refrescar la lista
    } catch (error) {
      throw error;
    }
  };

  const updateCliente = async (id: string, clienteData: Partial<Cliente>) => {
    try {
      const response = await fetch(`https://backinvent.onrender.com/api/clientes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clienteData),
      });

      if (!response.ok) throw new Error("Error al actualizar cliente");

      await fetchClientes(); // Refrescar la lista
    } catch (error) {
      throw error;
    }
  };

  // Calcular estadísticas basadas en hora de Venezuela
  const calcularStats = () => {
    const hoyVenezuela = getTodayVenezuela();
    const inicioDelMesVenezuela = getStartOfMonthVenezuela();

    const totalClientes = clientes.length;

    const nuevosHoy = clientes.filter((cliente) => {
      const fechaCliente = parseClienteDate(cliente.fecha);
      fechaCliente.setHours(0, 0, 0, 0);
      
      console.log('Fecha cliente (Venezuela):', fechaCliente);
      console.log('Hoy (Venezuela):', hoyVenezuela);
      console.log('¿Son iguales?', fechaCliente.getTime() === hoyVenezuela.getTime());
      
      return fechaCliente.getTime() === hoyVenezuela.getTime();
    }).length;

    const registrosMes = clientes.filter((cliente) => {
      const fechaCliente = parseClienteDate(cliente.fecha);
      fechaCliente.setHours(0, 0, 0, 0);
      
      return fechaCliente >= inicioDelMesVenezuela;
    }).length;

    console.log('--- ESTADÍSTICAS (HORA VENEZUELA) ---');
    console.log('Hoy Venezuela:', hoyVenezuela.toISOString());
    console.log('Inicio del mes Venezuela:', inicioDelMesVenezuela.toISOString());
    console.log('Nuevos hoy:', nuevosHoy);
    console.log('Registros mes:', registrosMes);

    return {
      totalClientes,
      nuevosHoy,
      clientesActivos: totalClientes,
      registrosMes,
    };
  };

  const stats = calcularStats();

  useEffect(() => {
    fetchClientes();
  }, []);

  return (
    <ClientesContext.Provider
      value={{
        clientes,
        loading,
        error,
        refreshClientes: fetchClientes,
        addCliente,
        deleteCliente,
        updateCliente,
        stats,
      }}
    >
      {children}
    </ClientesContext.Provider>
  );
};

export const useClientes = () => {
  const context = useContext(ClientesContext);
  if (context === undefined) {
    throw new Error("useClientes debe ser usado dentro de un ClientesProvider");
  }
  return context;
};

// Función auxiliar para formatear fechas en hora de Venezuela
export const formatVenezuelaDate = (dateString: string): string => {
  const date = parseClienteDate(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};