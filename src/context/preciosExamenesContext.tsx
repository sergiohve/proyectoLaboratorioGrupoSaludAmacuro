"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API_BASE as _API_ROOT } from "@/utils/api";
const uuidv4 = () => crypto.randomUUID();

const API_BASE = `${_API_ROOT}/api`;
const STORAGE_KEY = "precios_examenes_data";

export interface PrecioExamen {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  porUnidad: boolean;
}

const INITIAL_DATA: Omit<PrecioExamen, "id">[] = [
  { nombre: "T3 total / T4libre / TSH", precio: 15, categoria: "PRUEBAS ESPECIALES Y HORMONALES", porUnidad: true },
  { nombre: "ANTÍGENO PROSTÁTICO TOTAL/LIBRE", precio: 15, categoria: "PRUEBAS ESPECIALES Y HORMONALES", porUnidad: true },
  { nombre: "INSULINA BASAL", precio: 15, categoria: "PRUEBAS ESPECIALES Y HORMONALES", porUnidad: false },
  { nombre: "INSULINA BASAL + GLICEMIA + ÍNDICE DE HOMA", precio: 25, categoria: "PRUEBAS ESPECIALES Y HORMONALES", porUnidad: false },
  { nombre: "CURVA DE GLICEMIA + INSULINA (2 TOMAS) + GLICOLAB", precio: 45, categoria: "PRUEBAS ESPECIALES Y HORMONALES", porUnidad: false },
  { nombre: "SOLO CURVA DE INSULINA 2 TOMAS + GLICOLAB", precio: 40, categoria: "PRUEBAS ESPECIALES Y HORMONALES", porUnidad: false },
  { nombre: "CURVA DE INSULINA BASAL Y POSTPRANDIAL", precio: 30, categoria: "PRUEBAS ESPECIALES Y HORMONALES", porUnidad: false },
  { nombre: "PROCALCITONINA / DÍMERO D", precio: 22, categoria: "PRUEBAS ESPECIALES Y HORMONALES", porUnidad: true },
  { nombre: "VITAMINA D / VITAMINA B12 / BHCG", precio: 25, categoria: "PRUEBAS ESPECIALES Y HORMONALES", porUnidad: true },
  { nombre: "PCR Ultrasensible", precio: 10, categoria: "PRUEBAS ESPECIALES Y HORMONALES", porUnidad: false },
  { nombre: "LH / FSH / PROLACTINA / ANTIMULERIANA", precio: 17, categoria: "PRUEBAS ESPECIALES Y HORMONALES", porUnidad: true },
  { nombre: "PROGESTERONA / COVID / FERRITINA", precio: 20, categoria: "PRUEBAS ESPECIALES Y HORMONALES", porUnidad: true },
  { nombre: "MICROALBUMINURIA (INMUNOFLUORESCENCIA)", precio: 20, categoria: "PRUEBAS ESPECIALES Y HORMONALES", porUnidad: false },
  { nombre: "MICROALBUMINURIA (INMUNOF.) + RELAC ALB./CREAT", precio: 25, categoria: "PRUEBAS ESPECIALES Y HORMONALES", porUnidad: false },
  { nombre: "TROPONINA I", precio: 16, categoria: "PRUEBAS ESPECIALES Y HORMONALES", porUnidad: false },
  { nombre: "CK-MB", precio: 15, categoria: "PRUEBAS ESPECIALES Y HORMONALES", porUnidad: false },
  { nombre: "PÉPTIDO NATRIURÉTICO (NT-pro BNP)", precio: 35, categoria: "PRUEBAS ESPECIALES Y HORMONALES", porUnidad: false },
  { nombre: "LH / FSH", precio: 20, categoria: "ANALISIS HORMONALES ELISA", porUnidad: false },
  { nombre: "PROGESTERONA / ESTRADIOL / ACCP", precio: 15, categoria: "ANALISIS HORMONALES ELISA", porUnidad: true },
  { nombre: "MICOPLASMA PNEUMONIE (ELISA) IgG/IgM", precio: 20, categoria: "ANALISIS HORMONALES ELISA", porUnidad: true },
  { nombre: "CEA (Ag. Carcinoembrionario)", precio: 20, categoria: "ANALISIS HORMONALES ELISA", porUnidad: false },
  { nombre: "CA 15-3 (MAMARIO)", precio: 20, categoria: "ANALISIS HORMONALES ELISA", porUnidad: false },
  { nombre: "CA 19-9", precio: 20, categoria: "ANALISIS HORMONALES ELISA", porUnidad: false },
  { nombre: "CA-12-5 (OVÁRICO)", precio: 15, categoria: "ANALISIS HORMONALES ELISA", porUnidad: false },
  { nombre: "ALFAFETOPROTEÍNAS", precio: 15, categoria: "ANALISIS HORMONALES ELISA", porUnidad: false },
  { nombre: "EPTEIN BARR (ELISA) IGG/IGM", precio: 15, categoria: "ANALISIS HORMONALES ELISA", porUnidad: true },
  { nombre: "CITOMEGALOVIRUS (ELISA) IGG/IGM", precio: 15, categoria: "ANALISIS HORMONALES ELISA", porUnidad: true },
  { nombre: "TESTOSTERONA LIBRE", precio: 20, categoria: "ANALISIS HORMONALES ELISA", porUnidad: false },
  { nombre: "IGE", precio: 20, categoria: "ANALISIS HORMONALES ELISA", porUnidad: false },
  { nombre: "HELICOBACTER PYLORI EN SANGRE IgG/IgM", precio: 15, categoria: "ANALISIS HORMONALES ELISA", porUnidad: true },
  { nombre: "VDRL CUALITATIVO", precio: 5, categoria: "ANALISIS SEROLOGICO E INMUNOLOGICOS", porUnidad: false },
  { nombre: "SEROLOGÍA DE DENGUE IgG/IgM", precio: 5, categoria: "ANALISIS SEROLOGICO E INMUNOLOGICOS", porUnidad: false },
  { nombre: "SEROLOGÍA DE DENGUE IgG/IgM / NSI", precio: 15, categoria: "ANALISIS SEROLOGICO E INMUNOLOGICOS", porUnidad: false },
  { nombre: "HIV (TEST PACK)", precio: 18, categoria: "ANALISIS SEROLOGICO E INMUNOLOGICOS", porUnidad: false },
  { nombre: "RA-TEST", precio: 6, categoria: "ANALISIS SEROLOGICO E INMUNOLOGICOS", porUnidad: false },
  { nombre: "PROTEÍNA C REACTIVA LATEX", precio: 6, categoria: "ANALISIS SEROLOGICO E INMUNOLOGICOS", porUnidad: false },
  { nombre: "MONOTEST LATEX", precio: 6, categoria: "ANALISIS SEROLOGICO E INMUNOLOGICOS", porUnidad: false },
  { nombre: "ANTIESTREPTOLISINAS (ASTO)", precio: 6, categoria: "ANALISIS SEROLOGICO E INMUNOLOGICOS", porUnidad: false },
  { nombre: "CÉLULAS LE", precio: 6, categoria: "ANALISIS SEROLOGICO E INMUNOLOGICOS", porUnidad: false },
  { nombre: "HELICOBACTER PYLORI EN SANGRE / HECES (TEST PACK)", precio: 10, categoria: "ANALISIS SEROLOGICO E INMUNOLOGICOS", porUnidad: false },
  { nombre: "MARIHUANA / COCAÍNA", precio: 10, categoria: "ANALISIS SEROLOGICO E INMUNOLOGICOS", porUnidad: true },
  { nombre: "TOXOPLASMA DIFERENCIAL IgG/IgM (Test pack)", precio: 10, categoria: "ANALISIS SEROLOGICO E INMUNOLOGICOS", porUnidad: false },
  { nombre: 'HEPATITIS "A"', precio: 10, categoria: "ANALISIS SEROLOGICO E INMUNOLOGICOS", porUnidad: false },
  { nombre: 'HEPATITIS "B" (CORE)', precio: 10, categoria: "ANALISIS SEROLOGICO E INMUNOLOGICOS", porUnidad: false },
  { nombre: 'HEPATITIS "B" (Ag. DE SUPERFICIE)', precio: 10, categoria: "ANALISIS SEROLOGICO E INMUNOLOGICOS", porUnidad: false },
  { nombre: 'HEPATITIS "C"', precio: 10, categoria: "ANALISIS SEROLOGICO E INMUNOLOGICOS", porUnidad: false },
  { nombre: "ANTÍGENOS FEBRILES", precio: 8, categoria: "ANALISIS SEROLOGICO E INMUNOLOGICOS", porUnidad: false },
  { nombre: "PRUEBA DE EMBARAZO EN SANGRE u ORINA", precio: 5, categoria: "ANALISIS SEROLOGICO E INMUNOLOGICOS", porUnidad: false },
];

interface PreciosContextType {
  precios: PrecioExamen[];
  loading: boolean;
  addPrecio: (data: Omit<PrecioExamen, "id">) => Promise<void>;
  updatePrecio: (id: string, data: Omit<PrecioExamen, "id">) => Promise<void>;
  deletePrecio: (id: string) => Promise<void>;
  refreshPrecios: () => void;
}

const PreciosContext = createContext<PreciosContextType | undefined>(undefined);

function loadFromStorage(): PrecioExamen[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveToStorage(data: PrecioExamen[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export const PreciosExamenesProvider = ({ children }: { children: React.ReactNode }) => {
  const [precios, setPrecios] = useState<PrecioExamen[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/precios-examenes`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPrecios(data);
          saveToStorage(data);
          setLoading(false);
          return;
        }
      }
    } catch {}
    // Fallback: localStorage or initial data
    const stored = loadFromStorage();
    if (stored.length > 0) {
      setPrecios(stored);
    } else {
      const initial = INITIAL_DATA.map((d) => ({ ...d, id: uuidv4() }));
      setPrecios(initial);
      saveToStorage(initial);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const addPrecio = async (data: Omit<PrecioExamen, "id">) => {
    const newItem: PrecioExamen = { ...data, id: uuidv4() };
    const updated = [...precios, newItem];
    setPrecios(updated);
    saveToStorage(updated);
    try {
      await fetch(`${API_BASE}/precios-examenes`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newItem),
      });
    } catch {}
  };

  const updatePrecio = async (id: string, data: Omit<PrecioExamen, "id">) => {
    const updated = precios.map((p) => p.id === id ? { ...data, id } : p);
    setPrecios(updated);
    saveToStorage(updated);
    try {
      await fetch(`${API_BASE}/precios-examenes/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, id }),
      });
    } catch {}
  };

  const deletePrecio = async (id: string) => {
    const updated = precios.filter((p) => p.id !== id);
    setPrecios(updated);
    saveToStorage(updated);
    try {
      await fetch(`${API_BASE}/precios-examenes/${id}`, { method: "DELETE" });
    } catch {}
  };

  return (
    <PreciosContext.Provider value={{ precios, loading, addPrecio, updatePrecio, deletePrecio, refreshPrecios: loadData }}>
      {children}
    </PreciosContext.Provider>
  );
};

export const usePrecios = () => {
  const ctx = useContext(PreciosContext);
  if (!ctx) throw new Error("usePrecios must be used within PreciosExamenesProvider");
  return ctx;
};
