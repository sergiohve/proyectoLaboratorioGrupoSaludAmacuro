"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

const API = "https://backinvent.onrender.com/api/clientes";

interface Cliente {
  _id: string;
  nombre: string;
  cedula: string;
  edad: number;
  sexo: string;
  direccion: string;
  fecha: string;
  createdAt: string;
}

interface Stats {
  totalClientes: number;
  nuevosHoy: number;
  clientesActivos: number;
  registrosMes: number;
}

interface ClientesContextType {
  clientes: Cliente[];
  loading: boolean;
  error: string | null;
  refreshClientes: () => Promise<void>;
  addCliente: (cliente: Omit<Cliente, "_id" | "createdAt">) => Promise<void>;
  deleteCliente: (id: string) => Promise<void>;
  updateCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>;
  stats: Stats;
  page: number;
  rowsPerPage: number;
  total: number;
  searchTerm: string;
  setPage: (p: number) => void;
  setRowsPerPage: (r: number) => void;
  setSearchTerm: (s: string) => void;
}

const ClientesContext = createContext<ClientesContextType | undefined>(undefined);

const DEFAULT_STATS: Stats = { totalClientes: 0, nuevosHoy: 0, clientesActivos: 0, registrosMes: 0 };

export const ClientesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/stats`);
      if (res.ok) setStats(await res.json());
    } catch {}
  }, []);

  const fetchClientes = useCallback(async (
    pageNum = page,
    limitNum = rowsPerPage,
    search = searchTerm
  ) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: String(pageNum + 1), // MUI 0-indexed → API 1-indexed
        limit: String(limitNum),
        ...(search && { search }),
      });
      const res = await fetch(`${API}?${params}`);
      if (!res.ok) throw new Error("Error al cargar clientes");
      const data = await res.json();
      setClientes(data.data);
      setTotal(data.total);
    } catch (err) {
      setError("Error al cargar los clientes");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  // Refetch when pagination or search changes
  useEffect(() => {
    fetchClientes(page, rowsPerPage, searchTerm);
  }, [page, rowsPerPage, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSetSearchTerm = (s: string) => {
    setSearchTerm(s);
    setPage(0); // reset to first page on new search
  };

  const handleSetRowsPerPage = (r: number) => {
    setRowsPerPage(r);
    setPage(0);
  };

  const addCliente = async (clienteData: Omit<Cliente, "_id" | "createdAt">) => {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clienteData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error al crear cliente");
    }
    await Promise.all([fetchClientes(page, rowsPerPage, searchTerm), fetchStats()]);
  };

  const deleteCliente = async (id: string) => {
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar cliente");
    await Promise.all([fetchClientes(page, rowsPerPage, searchTerm), fetchStats()]);
  };

  const updateCliente = async (id: string, clienteData: Partial<Cliente>) => {
    const res = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clienteData),
    });
    if (!res.ok) throw new Error("Error al actualizar cliente");
    await fetchClientes(page, rowsPerPage, searchTerm);
  };

  const refreshClientes = () => fetchClientes(page, rowsPerPage, searchTerm);

  return (
    <ClientesContext.Provider
      value={{
        clientes,
        loading,
        error,
        refreshClientes,
        addCliente,
        deleteCliente,
        updateCliente,
        stats,
        page,
        rowsPerPage,
        total,
        searchTerm,
        setPage,
        setRowsPerPage: handleSetRowsPerPage,
        setSearchTerm: handleSetSearchTerm,
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

// Keep for backward compat with any component that imports it
export const formatVenezuelaDate = (dateString: string): string => {
  const date = new Date(dateString);
  const venezuelaOffset = -4 * 60;
  const venezDate = new Date(date.getTime() + (date.getTimezoneOffset() - venezuelaOffset) * 60000);
  const day = venezDate.getDate().toString().padStart(2, "0");
  const month = (venezDate.getMonth() + 1).toString().padStart(2, "0");
  const year = venezDate.getFullYear();
  const hours = venezDate.getHours().toString().padStart(2, "0");
  const minutes = venezDate.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};
