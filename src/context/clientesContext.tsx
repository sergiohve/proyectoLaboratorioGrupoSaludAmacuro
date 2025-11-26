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
      console.log(data);
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

  // Calcular estadísticas basadas en los clientes
  const calcularStats = () => {
    // Obtener fecha actual en hora local (sin horas, minutos, segundos)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Reset a las 00:00:00.000

    // Inicio del mes en hora local
    const inicioDelMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    inicioDelMes.setHours(0, 0, 0, 0);

    const totalClientes = clientes.length;

    const nuevosHoy = clientes.filter((cliente) => {
        // Convertir fecha del cliente a fecha local (sin horas)
        const fechaCliente = new Date(cliente.fecha);
        fechaCliente.setHours(0, 0, 0, 0);
        
        console.log('Fecha cliente:', fechaCliente);
        console.log('Hoy:', hoy);
        console.log('¿Son iguales?', fechaCliente.getTime() === hoy.getTime());
        
        return fechaCliente.getTime() === hoy.getTime();
    }).length;

    const registrosMes = clientes.filter((cliente) => {
        // Convertir fecha del cliente a fecha local (sin horas)
        const fechaCliente = new Date(cliente.fecha);
        fechaCliente.setHours(0, 0, 0, 0);
        
        return fechaCliente >= inicioDelMes;
    }).length;

    console.log('--- ESTADÍSTICAS ---');
    console.log('Hoy:', hoy.toISOString());
    console.log('Inicio del mes:', inicioDelMes.toISOString());
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
console.log(stats)
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
