"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  MenuItem,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  Checkbox,
  ListItemText,
} from "@mui/material";
import {
  Save,
  MedicalServices,
  Add,
  Delete,
  Calculate,
  Close,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

interface Cliente {
  _id: string;
  nombre: string;
  cedula: string;
  edad: number;
  sexo: string;
}

interface CampoExamen {
  nombre: string;
  resultado: string;
  valorReferencia: string;
  tipoExamen?: string; // Para identificar de qué tipo de examen proviene (opcional en plantillas)
}

interface ExamenForm {
  cliente: string;
  tiposExamen: string[]; // Ahora es un array
  area: string; // Área principal o combinada
  observaciones: string;
  fechaExamen: string;
  campos: CampoExamen[];
}

// Plantillas de exámenes basadas en las imágenes (sin cambios)
const plantillasExamenes: {
  [key: string]: { area: string; campos: CampoExamen[] };
} = {
  "HEMATOLOGIA COMPLETA": {
    area: "HEMATOLOGIA COMPLETA",
    campos: [
      {
        nombre: "Leucocitos",
        resultado: "",
        valorReferencia: "(4.5 - 10.5)x10³/mm³",
      },
      {
        nombre: "Eritrocitos",
        resultado: "",
        valorReferencia: "4 - 6.00 x10⁶/uL",
      },
      {
        nombre: "Hemoglobina",
        resultado: "",
        valorReferencia: "11 - 18 gr. %",
      },
      { nombre: "Hematocrito", resultado: "", valorReferencia: "35-60%" },
      { nombre: "Segmentados", resultado: "", valorReferencia: "42.2 - 75.2%" },
      { nombre: "Linfocitos", resultado: "", valorReferencia: "20.5 - 51.1%" },
      { nombre: "Eosinofilos", resultado: "", valorReferencia: "0 - 4 %" },
      { nombre: "Monocitos", resultado: "", valorReferencia: "0 - 5%" },
      { nombre: "VCM", resultado: "", valorReferencia: "80 - 99.9fl" },
      { nombre: "HCM", resultado: "", valorReferencia: "27.0 - 31.0pg" },
      { nombre: "CHCM", resultado: "", valorReferencia: "33.0 - 37.0g/dl" },
      {
        nombre: "Plaquetas",
        resultado: "",
        valorReferencia: "150 - 450 x10³uL",
      },
      { nombre: "MPV", resultado: "", valorReferencia: "6.5 - 12.0 fl" },
    ],
  },
  "QUIMICA SANGUINEA 3": {
    area: "QUIMICA SANGUINEA",
    campos: [
      { nombre: "GLICEMIA", resultado: "", valorReferencia: "70 - 100 mg/dL" },
      { nombre: "UREA", resultado: "", valorReferencia: "15 - 45 mg/dL" },
      {
        nombre: "CREATININA",
        resultado: "",
        valorReferencia: "0.4 - 1.4 mg/dL",
      },
    ],
  },
  "QUIMICA SANGUINEA COMPLETA": {
    area: "QUIMICA SANGUINEA",
    campos: [
      { nombre: "GLICEMIA", resultado: "", valorReferencia: "70 - 100 mg/dL" },
      { nombre: "UREA", resultado: "", valorReferencia: "15 - 45 mg/dL" },
      {
        nombre: "CREATININA",
        resultado: "",
        valorReferencia: "0.4 - 1.4 mg/dL",
      },
      { nombre: "COLESTEROL", resultado: "", valorReferencia: "<200mg/dl" },
      {
        nombre: "H.D.L.",
        resultado: "",
        valorReferencia: "Mujeres 33-75mg/dl Hombres 26-63 mg/dl",
      },
      { nombre: "L.D.L.", resultado: "", valorReferencia: "66-178 mg/dl" },
      { nombre: "V.L.D.L.", resultado: "", valorReferencia: "20-40 mg/dl" },
      { nombre: "Triglicéridos", resultado: "", valorReferencia: "<150mg/dl" },
      {
        nombre: "LIPIDOS TOTALES",
        resultado: "",
        valorReferencia: "<800mg/dl",
      },
      {
        nombre: "RELACION COLESTEROL /HDL",
        resultado: "",
        valorReferencia: "2.5 - 4.5",
      },
      {
        nombre: "RELACION LDL /HDL",
        resultado: "",
        valorReferencia: "1.5 - 3.5",
      },
      {
        nombre: "ACIDO URICO",
        resultado: "",
        valorReferencia: "Mujer: 2.5 - 5.0 mg/dL Hombre: 2.5 - 6.0 mg/dL",
      },
      {
        nombre: "TGO",
        resultado: "",
        valorReferencia: "Mujer Hasta 38UI/L Hombre hasta 32 UI/L",
      },
      {
        nombre: "TGP",
        resultado: "",
        valorReferencia: "Mujer Hasta 31UI/L Hombre hasta 41 UI/L",
      },
      {
        nombre: "PROTEINA TOTALES",
        resultado: "",
        valorReferencia: "6.2 - 8.5 g/dL",
      },
      { nombre: "ALBUMINAS", resultado: "", valorReferencia: "3.5 - 5.3 g/dL" },
      {
        nombre: "GLOBULINAS",
        resultado: "",
        valorReferencia: "2.5 - 3.5 g/dL",
      },
      {
        nombre: "RELACION ALBUMINA /GLOBULINAS",
        resultado: "",
        valorReferencia: "1.40 - 1.76",
      },
      { nombre: "CALCIO", resultado: "", valorReferencia: "8.5 - 10.4 mg/dL" },
      {
        nombre: "FOSFORO",
        resultado: "",
        valorReferencia: "Niños 4 - 7 Adultos 2.5 - 4.8 mg/dL",
      },
      {
        nombre: "BILIRRUBINA TOTAL",
        resultado: "",
        valorReferencia: "0.2 - 1.0 mg/dL",
      },
      {
        nombre: "BILIRRUBINA DIRECTA",
        resultado: "",
        valorReferencia: "0.0 - 0.5 mg/dL",
      },
      { nombre: "BILIRRUBINA INDIRECTA", resultado: "", valorReferencia: "" },
    ],
  },
  "ORINA COMPLETA": {
    area: "ORINA",
    campos: [
      { nombre: "COLOR", resultado: "", valorReferencia: "AMARILLO" },
      { nombre: "OLOR", resultado: "", valorReferencia: "SUGENERIS" },
      { nombre: "ASPECTO", resultado: "", valorReferencia: "LIMPIDA" },
      { nombre: "DENSIDAD", resultado: "", valorReferencia: "1015 - 1025" },
      { nombre: "REACCION", resultado: "", valorReferencia: "" },
      { nombre: "PH", resultado: "", valorReferencia: "4.6 - 8.0" },
      { nombre: "CUERPO CETONICO", resultado: "", valorReferencia: "NEGATIVO" },
      { nombre: "BILIRRUBINA", resultado: "", valorReferencia: "NEGATIVO" },
      { nombre: "UROBILINOGENO", resultado: "", valorReferencia: "NEGATIVO" },
      { nombre: "PROTEINAS", resultado: "", valorReferencia: "NEGATIVO" },
      { nombre: "SANGRE", resultado: "", valorReferencia: "NEGATIVO" },
      { nombre: "GLUCOSA", resultado: "", valorReferencia: "NEGATIVO" },
      { nombre: "NITRITO", resultado: "", valorReferencia: "NEGATIVO" },
      { nombre: "LEUCOCITOS", resultado: "", valorReferencia: "0 - 3 x campo" },
      { nombre: "BACTERIAS", resultado: "", valorReferencia: "ESCASAS" },
      { nombre: "CELULAS", resultado: "", valorReferencia: "1 - 2 x campo" },
      {
        nombre: "ERITROCITOS",
        resultado: "",
        valorReferencia: "0 - 3 x campo",
      },
      {
        nombre: "ACUMULOS LEUCOCITARIOS",
        resultado: "",
        valorReferencia: "0 x campo",
      },
      { nombre: "CRISTALES", resultado: "", valorReferencia: "0" },
      { nombre: "CILINDROS", resultado: "", valorReferencia: "0 x campo" },
      { nombre: "MUCINA", resultado: "", valorReferencia: "" },
    ],
  },
  "HECES COMPLETO": {
    area: "HECES",
    campos: [
      { nombre: "COLOR", resultado: "", valorReferencia: "MARRON" },
      { nombre: "CONSISTENCIA", resultado: "", valorReferencia: "......" },
      { nombre: "ASPECTO", resultado: "", valorReferencia: "......" },
      { nombre: "SANGRE", resultado: "", valorReferencia: "AUSENTE" },
      { nombre: "MOCO", resultado: "", valorReferencia: "AUSENTE" },
      { nombre: "OLOR", resultado: "", valorReferencia: "FECAL" },
      {
        nombre: "RESTOS ALIMENTICIOS",
        resultado: "",
        valorReferencia: "AUSENTES",
      },
      {
        nombre: "PROTOZOARIOS",
        resultado: "",
        valorReferencia: "NO SE OBSERVARON EN LA MUESTRA EXAMINADA",
      },
      {
        nombre: "HELMINTOS",
        resultado: "",
        valorReferencia: "NO SE OBSERVARON EN LA MUESTRA EXAMINADA",
      },
      { nombre: "ERITROCITOS", resultado: "", valorReferencia: "x campo" },
      { nombre: "LEUCOCITOS", resultado: "", valorReferencia: "x campo" },
    ],
  },
  HCG: {
    area: "PRUEBA DE EMBARAZO",
    campos: [
      {
        nombre: "PRUEBA DE EMBARAZO (HCG)",
        resultado: "",
        valorReferencia: "",
      },
    ],
  },
  SEROLOGIA: {
    area: "SEROLOGIA",
    campos: [
      { nombre: "HIV", resultado: "", valorReferencia: "NEGATIVO" },
      { nombre: "VDRL", resultado: "", valorReferencia: "NO REACTIVO" },
    ],
  },
  HEPATITIS: {
    area: "QUIMICA SANGUINEA",
    campos: [
      {
        nombre: 'HEPATITIS "B" (Ag. SUPERF.)',
        resultado: "",
        valorReferencia: "NEGATIVO",
      },
      { nombre: 'HEPATITIS "C"', resultado: "", valorReferencia: "NEGATIVO" },
    ],
  },
  "PERFIL LIPIDICO": {
    area: "QUIMICA SANGUINEA",
    campos: [
      { nombre: "COLESTEROL", resultado: "", valorReferencia: "<200mg/dl" },
      {
        nombre: "H.D.L.",
        resultado: "",
        valorReferencia: "Mujeres 33-75mg/dl Hombres 26-63 mg/dl",
      },
      { nombre: "L.D.L.", resultado: "", valorReferencia: "66-178 mg/dl" },
      { nombre: "V.L.D.L.", resultado: "", valorReferencia: "20-40 mg/dl" },
      { nombre: "Triglicéridos", resultado: "", valorReferencia: "<150mg/dl" },
      {
        nombre: "LIPIDOS TOTALES",
        resultado: "",
        valorReferencia: "<800mg/dl",
      },
      {
        nombre: "RELACION COLESTEROL /HDL",
        resultado: "",
        valorReferencia: "2.5 - 4.5",
      },
      {
        nombre: "RELACION LDL /HDL",
        resultado: "",
        valorReferencia: "1.5 - 3.5",
      },
    ],
  },
  TIROIDES: {
    area: "HORMONAS",
    campos: [
      { nombre: "T3", resultado: "", valorReferencia: "1.4 - 4.2 pg/ml" },
      {
        nombre: "T4 LIBRE",
        resultado: "",
        valorReferencia: "0.8 - 2.0 ng/dl(ADULTO)",
      },
      { nombre: "TSH", resultado: "", valorReferencia: "0.40 - 4.90 IU/ml" },
    ],
  },
  "LIPIDOS TOTALES": {
    area: "QUIMICA SANGUINEA",
    campos: [
      {
        nombre: "LIPIDOS TOTALES",
        resultado: "",
        valorReferencia: "<800 mg/dL",
      },
    ],
  },
  "INDICE DE HOMA": {
    area: "HORMONAS",
    campos: [
      {
        nombre: "INDICE DE HOMA",
        resultado: "",
        valorReferencia: "≤ 2.5 (Normal)",
      },
    ],
  },
  "GLICEMIA": {
    area: "QUIMICA SANGUINEA",
    campos: [
      { nombre: "GLICEMIA", resultado: "", valorReferencia: "70 - 100 mg/dL" },
    ],
  },
  "QUIMICA SANGUINEA 2": {
    area: "QUIMICA SANGUINEA",
    campos: [
      { nombre: "UREA", resultado: "", valorReferencia: "15 - 45 mg/dL" },
      {
        nombre: "CREATININA",
        resultado: "",
        valorReferencia: "0.4 - 1.4 mg/dL",
      },
    ],
  },
  "QUIMICA SANGUINEA 4": {
    area: "QUIMICA SANGUINEA",
    campos: [
      { nombre: "GLICEMIA", resultado: "", valorReferencia: "70 - 100 mg/dL" },
      { nombre: "COLESTEROL", resultado: "", valorReferencia: "<200mg/dl" },
      { nombre: "Triglicéridos", resultado: "", valorReferencia: "<150 mg/dl" },
      {
        nombre: "LIPIDOS TOTALES",
        resultado: "",
        valorReferencia: "<800mg/dl",
      },
    ],
  },
  "PERFIL LIPIDICO BASICO": {
    area: "QUIMICA SANGUINEA",
    campos: [
      { nombre: "COLESTEROL", resultado: "", valorReferencia: "<200mg/dl" },
      { nombre: "Triglicéridos", resultado: "", valorReferencia: "<150 mg/dl" },
      {
        nombre: "LIPIDOS TOTALES",
        resultado: "",
        valorReferencia: "<800mg/dl",
      },
    ],
  },
  "QUIMICA SANGUINEA 7": {
    area: "QUIMICA SANGUINEA",
    campos: [
      { nombre: "GLICEMIA", resultado: "", valorReferencia: "70 - 100 mg/dL" },
      { nombre: "UREA", resultado: "", valorReferencia: "15 - 45 mg/dL" },
      {
        nombre: "CREATININA",
        resultado: "",
        valorReferencia: "0.4 - 1.4 mg/dL",
      },
      { nombre: "COLESTEROL", resultado: "", valorReferencia: "<200mg/dl" },
      {
        nombre: "TRIGLICERIDOS",
        resultado: "",
        valorReferencia: "<150 mg/dl",
      },
      {
        nombre: "LIPIDOS TOTALES",
        resultado: "",
        valorReferencia: "<800mg/dl",
      },
      {
        nombre: "ACIDO URICO",
        resultado: "",
        valorReferencia: "Mujer: 2.5 - 5.0 mg/dL Hombre: 2.5 - 6.0 mg/dL",
      },
    ],
  },
  "HECES COMPLETO 2": {
    area: "HECES",
    campos: [
      { nombre: "COLOR", resultado: "", valorReferencia: "MARRON" },
      { nombre: "CONSISTENCIA", resultado: "", valorReferencia: "......" },
      { nombre: "ASPECTO", resultado: "", valorReferencia: "......" },
      { nombre: "SANGRE", resultado: "", valorReferencia: "AUSENTE" },
      { nombre: "MOCO", resultado: "", valorReferencia: "AUSENTE" },
      { nombre: "OLOR", resultado: "", valorReferencia: "FECAL" },
      {
        nombre: "RESTOS ALIMENTICIOS",
        resultado: "",
        valorReferencia: "AUSENTES",
      },
      {
        nombre: "PROTOZOARIOS",
        resultado: "",
        valorReferencia: "NO SE OBSERVARON EN LA MUESTRA EXAMINADA",
      },
      {
        nombre: "HELMINTOS",
        resultado: "",
        valorReferencia: "NO SE OBSERVARON EN LA MUESTRA EXAMINADA",
      },
      { nombre: "ERITROCITOS", resultado: "", valorReferencia: "x campo" },
      { nombre: "LEUCOCITOS", resultado: "", valorReferencia: "x campo" },
      { nombre: "OTROS", resultado: "", valorReferencia: "" },
      { nombre: "PH", resultado: "", valorReferencia: "" },
      { nombre: "REACCION", resultado: "", valorReferencia: "" },
    ],
  },
  "ORINA COMPLETA 2": {
    area: "ORINA",
    campos: [
      { nombre: "COLOR", resultado: "", valorReferencia: "AMARILLO" },
      { nombre: "OLOR", resultado: "", valorReferencia: "SUGENERIS" },
      { nombre: "ASPECTO", resultado: "", valorReferencia: "LIMPIDA" },
      { nombre: "DENSIDAD", resultado: "", valorReferencia: "1015 - 1025" },
      { nombre: "REACCION", resultado: "", valorReferencia: "" },
      { nombre: "PH", resultado: "", valorReferencia: "4.6 - 8.0" },
      { nombre: "CUERPO CETONICO", resultado: "", valorReferencia: "NEGATIVO" },
      { nombre: "BILIRRUBINA", resultado: "", valorReferencia: "NEGATIVO" },
      { nombre: "UROBILINOGENO", resultado: "", valorReferencia: "NEGATIVO" },
      { nombre: "PROTEINAS", resultado: "", valorReferencia: "NEGATIVO" },
      { nombre: "SANGRE", resultado: "", valorReferencia: "NEGATIVO" },
      { nombre: "GLUCOSA", resultado: "", valorReferencia: "NEGATIVO" },
      { nombre: "NITRITO", resultado: "", valorReferencia: "NEGATIVO" },
      { nombre: "LEUCOCITOS", resultado: "", valorReferencia: "0 - 3 x campo" },
      { nombre: "BACTERIAS", resultado: "", valorReferencia: "ESCASAS" },
      { nombre: "CELULAS", resultado: "", valorReferencia: "1 - 2 x campo" },
      {
        nombre: "ERITROCITOS",
        resultado: "",
        valorReferencia: "0 - 3 x campo",
      },
      {
        nombre: "ACUMULOS LEUCOCITARIOS",
        resultado: "",
        valorReferencia: "0 x campo",
      },
      { nombre: "CRISTALES", resultado: "", valorReferencia: "0" },
      { nombre: "CILINDROS", resultado: "", valorReferencia: "0 x campo" },
      { nombre: "MUCINA", resultado: "", valorReferencia: "" },
      { nombre: "OBSERVACIONES", resultado: "", valorReferencia: "" },
    ],
  },
  "ORINA COMPLETA 3": {
    area: "ORINA",
    campos: [
      { nombre: "COLOR", resultado: "", valorReferencia: "AMARILLO" },
      { nombre: "OLOR", resultado: "", valorReferencia: "SUGENERIS" },
      { nombre: "ASPECTO", resultado: "", valorReferencia: "LIMPIDA" },
      { nombre: "DENSIDAD", resultado: "", valorReferencia: "1015 - 1025" },
      { nombre: "REACCION", resultado: "", valorReferencia: "" },
      { nombre: "PH", resultado: "", valorReferencia: "4.6 - 8.0" },
      { nombre: "LEUCOCITOS", resultado: "", valorReferencia: "0 - 3 x campo" },
      { nombre: "BACTERIAS", resultado: "", valorReferencia: "ESCASAS" },
      { nombre: "CELULAS", resultado: "", valorReferencia: "1 - 2 x campo" },
      { nombre: "ERITROCITOS", resultado: "", valorReferencia: "0 - 3 x campo" },
      { nombre: "LEUCOCITOS ACUM.", resultado: "", valorReferencia: "0 x campo" },
      { nombre: "CUERPO CETONICO", resultado: "", valorReferencia: "NEGATIVO" },
      { nombre: "BILIRRUBINA", resultado: "", valorReferencia: "NEGATIVO" },
      { nombre: "UROBILINOGENO", resultado: "", valorReferencia: "NEGATIVO" },
      { nombre: "PROTEINAS", resultado: "", valorReferencia: "NEGATIVO" },
      { nombre: "SANGRE", resultado: "", valorReferencia: "NEGATIVO" },
      { nombre: "GLUCOSA", resultado: "", valorReferencia: "NEGATIVO" },
      { nombre: "NITRITO", resultado: "", valorReferencia: "NEGATIVO" },
      { nombre: "CRISTALES", resultado: "", valorReferencia: "0 x campo" },
      { nombre: "CILINDROS", resultado: "", valorReferencia: "0 x campo" },
      { nombre: "MUCINA", resultado: "", valorReferencia: "" },
      { nombre: "OBSERVACIONES", resultado: "", valorReferencia: "" },
    ],
  },
  "PERFIL PROTEICO": {
    area: "QUIMICA SANGUINEA",
    campos: [
      {
        nombre: "PROTEINA TOTALES",
        resultado: "",
        valorReferencia: "ADULTOS 6.6 - 8.7 g/dL",
      },
      {
        nombre: "ALBUMINAS",
        resultado: "",
        valorReferencia: "ADULTOS 3.81 - 4.65 g/dL",
      },
      { nombre: "GLOBULINAS", resultado: "", valorReferencia: "2.5 - 3.5 g/dL" },
      {
        nombre: "RELACION ALBUMINA /GLOBULINAS",
        resultado: "",
        valorReferencia: "1.40 - 1.76",
      },
    ],
  },
  "QUIMICA SANGUINEA CON LIPIDOGRAMA": {
    area: "QUIMICA SANGUINEA",
    campos: [
      { nombre: "GLICEMIA", resultado: "", valorReferencia: "70 - 100 mg/dL" },
      { nombre: "UREA", resultado: "", valorReferencia: "15 - 45 mg/dL" },
      { nombre: "CREATININA", resultado: "", valorReferencia: "0.4 - 1.4 mg/dL" },
      {
        nombre: "ACIDO URICO",
        resultado: "",
        valorReferencia: "Mujer: 2.5 - 5.0 mg/dL Hombre: 2.5 - 6.0 mg/dL",
      },
      { nombre: "COLESTEROL", resultado: "", valorReferencia: "<200mg/dl" },
      {
        nombre: "H.D.L.",
        resultado: "",
        valorReferencia: "Mujeres 33-75mg/dl Hombres 26-63 mg/dl",
      },
      { nombre: "L.D.L.", resultado: "", valorReferencia: "66-178 mg/dl" },
      { nombre: "V.L.D.L.", resultado: "", valorReferencia: "20-40 mg/dl" },
      { nombre: "Triglicéridos", resultado: "", valorReferencia: "<150 mg/dl" },
      { nombre: "LIPIDOS TOTALES", resultado: "", valorReferencia: "<800mg/dl" },
      {
        nombre: "RELACION COLESTEROL /HDL",
        resultado: "",
        valorReferencia: "2.5 - 4.5",
      },
      {
        nombre: "RELACION LDL /HDL",
        resultado: "",
        valorReferencia: "1.5 - 3.5",
      },
    ],
  },
  "QUIMICA SANGUINEA COMPLETA 2": {
    area: "QUIMICA SANGUINEA",
    campos: [
      { nombre: "GLICEMIA", resultado: "", valorReferencia: "70 - 100 mg/dL" },
      { nombre: "UREA", resultado: "", valorReferencia: "15 - 45 mg/dL" },
      { nombre: "CREATININA", resultado: "", valorReferencia: "0.4 - 1.4 mg/dL" },
      { nombre: "COLESTEROL", resultado: "", valorReferencia: "<200mg/dl" },
      {
        nombre: "H.D.L.",
        resultado: "",
        valorReferencia: "Mujeres 33-75mg/dl Hombres 26-63 mg/dl",
      },
      { nombre: "L.D.L.", resultado: "", valorReferencia: "66-178 mg/dl" },
      { nombre: "V.L.D.L.", resultado: "", valorReferencia: "20-40 mg/dl" },
      { nombre: "Triglicéridos", resultado: "", valorReferencia: "<150mg/dl" },
      { nombre: "LIPIDOS TOTALES", resultado: "", valorReferencia: "<800mg/dl" },
      {
        nombre: "RELACION COLESTEROL /HDL",
        resultado: "",
        valorReferencia: "2.5 - 4.5",
      },
      {
        nombre: "RELACION LDL /HDL",
        resultado: "",
        valorReferencia: "1.5 - 3.5",
      },
      {
        nombre: "ACIDO URICO",
        resultado: "",
        valorReferencia: "Mujer: 2.5 - 5.0 mg/dL Hombre: 2.5 - 6.0 mg/dL",
      },
      { nombre: "MAGNESIO", resultado: "", valorReferencia: "1.6 - 2.5 mg/dL" },
      {
        nombre: "TGO",
        resultado: "",
        valorReferencia: "Mujer Hasta 38UI/L Hombre hasta 32 UI/L",
      },
      {
        nombre: "TGP",
        resultado: "",
        valorReferencia: "Mujer Hasta 31UI/L Hombre hasta 41 UI/L",
      },
      {
        nombre: "PROTEINA TOTALES",
        resultado: "",
        valorReferencia: "6.2 - 8.5 g/dL",
      },
      { nombre: "ALBUMINAS", resultado: "", valorReferencia: "3.5 - 5.3 g/dL" },
      { nombre: "GLOBULINAS", resultado: "", valorReferencia: "2.5 - 3.5 g/dL" },
      {
        nombre: "RELACION ALBUMINA /GLOBULINAS",
        resultado: "",
        valorReferencia: "1.40 - 1.76",
      },
      { nombre: "CALCIO", resultado: "", valorReferencia: "8.5 - 10.4 mg/dL" },
      {
        nombre: "FOSFORO",
        resultado: "",
        valorReferencia: "Niños 4 - 7 Adultos 2.5 - 4.8 mg/dL",
      },
      {
        nombre: "BILIRRUBINA TOTAL",
        resultado: "",
        valorReferencia: "0.2 - 1.0 mg/dL",
      },
      {
        nombre: "BILIRRUBINA DIRECTA",
        resultado: "",
        valorReferencia: "0.0 - 0.5 mg/dL",
      },
      { nombre: "BILIRRUBINA INDIRECTA", resultado: "", valorReferencia: "" },
      {
        nombre: "HIERRO",
        resultado: "",
        valorReferencia: "Hombres: 65 - 160 μg/dl Mujer 40 - 140 μg/dl",
      },
    ],
  },
  "QUIMICA SANGUINEA COMPLETA 3": {
    area: "QUIMICA SANGUINEA",
    campos: [
      { nombre: "GLICEMIA", resultado: "", valorReferencia: "70 - 100 mg/dL" },
      { nombre: "UREA", resultado: "", valorReferencia: "15 - 45 mg/dL" },
      { nombre: "CREATININA", resultado: "", valorReferencia: "0.4 - 1.4 mg/dL" },
      { nombre: "COLESTEROL", resultado: "", valorReferencia: "<200mg/dl" },
      {
        nombre: "H.D.L.",
        resultado: "",
        valorReferencia: "Mujeres 33-75mg/dl Hombres 26-63 mg/dl",
      },
      { nombre: "L.D.L.", resultado: "", valorReferencia: "66-178 mg/dl" },
      { nombre: "V.L.D.L.", resultado: "", valorReferencia: "20-40 mg/dl" },
      { nombre: "Triglicéridos", resultado: "", valorReferencia: "<150mg/dl" },
      { nombre: "LIPIDOS TOTALES", resultado: "", valorReferencia: "<800mg/dl" },
      {
        nombre: "RELACION COLESTEROL /HDL",
        resultado: "",
        valorReferencia: "2.5 - 4.5",
      },
      {
        nombre: "RELACION LDL /HDL",
        resultado: "",
        valorReferencia: "1.5 - 3.5",
      },
      {
        nombre: "ACIDO URICO",
        resultado: "",
        valorReferencia: "Mujer: 2.5 - 5.0 mg/dL Hombre: 2.5 - 6.0 mg/dL",
      },
      {
        nombre: "TGO",
        resultado: "",
        valorReferencia: "Mujer Hasta 38UI/L Hombre hasta 32 UI/L",
      },
      {
        nombre: "TGP",
        resultado: "",
        valorReferencia: "Mujer Hasta 31UI/L Hombre hasta 41 UI/L",
      },
      {
        nombre: "PROTEINA TOTALES",
        resultado: "",
        valorReferencia: "6.2 - 8.5 g/dL",
      },
      { nombre: "ALBUMINAS", resultado: "", valorReferencia: "3.5 - 5.3 g/dL" },
      { nombre: "GLOBULINAS", resultado: "", valorReferencia: "2.5 - 3.5 g/dL" },
      {
        nombre: "RELACION ALBUMINA /GLOBULINAS",
        resultado: "",
        valorReferencia: "1.40 - 1.76",
      },
      { nombre: "CALCIO", resultado: "", valorReferencia: "8.5 - 10.4 mg/dL" },
      {
        nombre: "FOSFORO",
        resultado: "",
        valorReferencia: "Niños 4 - 7 Adultos 2.5 - 4.8 mg/dL",
      },
      {
        nombre: "BILIRRUBINA TOTAL",
        resultado: "",
        valorReferencia: "0.2 - 1.0 mg/dL",
      },
      {
        nombre: "BILIRRUBINA DIRECTA",
        resultado: "",
        valorReferencia: "0.0 - 0.5 mg/dL",
      },
      { nombre: "BILIRRUBINA INDIRECTA", resultado: "", valorReferencia: "" },
    ],
  },
  "BCCG CUANTITATIVO": {
    area: "MISCELANEOS",
    campos: [
      {
        nombre: "BCCG CUANTITATIVO",
        resultado: "",
        valorReferencia: "0 - 5 mIU/ml (Mujeres no Embarazada)",
      },
    ],
  },
  "PERFIL ENZIMATICO": {
    area: "QUIMICA SANGUINEA",
    campos: [
      { nombre: "LDH", resultado: "", valorReferencia: "230 - 460 IU/L" },
      {
        nombre: "FOSFATASA ALCALINA",
        resultado: "",
        valorReferencia: "ADULTOS 65 - 300 UI/L",
      },
      { nombre: "CPK", resultado: "", valorReferencia: "25 - 192 IU/L" },
      { nombre: "AMILASA", resultado: "", valorReferencia: "< ó igual 125 UI/L" },
      { nombre: "LIPASA", resultado: "", valorReferencia: "U/L" },
    ],
  },
  "QUIMICA SANGUINEA CON ENZIMAS": {
    area: "QUIMICA SANGUINEA",
    campos: [
      { nombre: "GLICEMIA", resultado: "", valorReferencia: "70 - 100 mg/dL" },
      { nombre: "LDH", resultado: "", valorReferencia: "230 - 460 IU/L" },
      { nombre: "MAGNESIO", resultado: "", valorReferencia: "1.6 - 2.5 mg/dl" },
      {
        nombre: "FOSFATASA ALCALINA",
        resultado: "",
        valorReferencia: "ADULTOS 65 - 300 UI/L",
      },
      { nombre: "CALCIO", resultado: "", valorReferencia: "8.5 - 10.4 mg/dL" },
      {
        nombre: "FOSFORO",
        resultado: "",
        valorReferencia: "Niños 4 - 7 Adultos 2.5 - 4.8 mg/dL",
      },
      { nombre: "CPK", resultado: "", valorReferencia: "25 - 192 IU/L" },
      { nombre: "AMILASA", resultado: "", valorReferencia: "< ó igual 125 UI/L" },
      { nombre: "LIPASA", resultado: "", valorReferencia: "U/L" },
      { nombre: "UREA", resultado: "", valorReferencia: "15 - 45 mg/dL" },
      { nombre: "CREATININA", resultado: "", valorReferencia: "0.4 - 1.4 mg/dL" },
    ],
  },
  "HECES COMPLETO 3": {
    area: "HECES",
    campos: [
      { nombre: "COLOR", resultado: "", valorReferencia: "MARRON" },
      { nombre: "CONSISTENCIA", resultado: "", valorReferencia: "......" },
      { nombre: "ASPECTO", resultado: "", valorReferencia: "......" },
      { nombre: "SANGRE", resultado: "", valorReferencia: "AUSENTE" },
      { nombre: "MOCO", resultado: "", valorReferencia: "AUSENTE" },
      { nombre: "OLOR", resultado: "", valorReferencia: "FECAL" },
      {
        nombre: "RESTOS ALIMENTICIOS",
        resultado: "",
        valorReferencia: "AUSENTES",
      },
      {
        nombre: "PROTOZOARIOS",
        resultado: "",
        valorReferencia: "NO SE OBSERVARON EN LA MUESTRA EXAMINADA",
      },
      {
        nombre: "HELMINTOS",
        resultado: "",
        valorReferencia: "NO SE OBSERVARON EN LA MUESTRA EXAMINADA",
      },
      { nombre: "CROMISTA", resultado: "", valorReferencia: "" },
      { nombre: "ERITROCITOS", resultado: "", valorReferencia: "x campo" },
      { nombre: "LEUCOCITOS", resultado: "", valorReferencia: "x campo" },
      { nombre: "OTROS", resultado: "", valorReferencia: "" },
    ],
  },
  "ORINA 24 HORAS": {
    area: "ORINA",
    campos: [
      { nombre: "CALCIO", resultado: "", valorReferencia: "2 - 17.5 mg/dl" },
      { nombre: "FOSFORO", resultado: "", valorReferencia: "20 - 60 mg/dl" },
      { nombre: "ACIDO URICO", resultado: "", valorReferencia: "7 - 58 mg/dl" },
      { nombre: "CREATININA", resultado: "", valorReferencia: "90 - 155 mg/dl" },
      {
        nombre: "RELACION ACIDO URICO/CREATININA",
        resultado: "",
        valorReferencia: "0.47",
      },
      {
        nombre: "RELACION FOSFORO/CREATININA",
        resultado: "",
        valorReferencia: "1.40",
      },
      {
        nombre: "RELACION CALCIO/CREATININA",
        resultado: "",
        valorReferencia: "0.01",
      },
    ],
  },
  "ELECTROLITOS": {
    area: "MISCELANEOS",
    campos: [
      { nombre: "SODIO (Na+)", resultado: "", valorReferencia: "135-155 mmol/L" },
      { nombre: "POTASIO (K+)", resultado: "", valorReferencia: "3.5 - 5.3 mmol/L" },
    ],
  },
  "HEMATOLOGIA COMPLETA 2": {
    area: "HEMATOLOGIA COMPLETA",
    campos: [
      {
        nombre: "Leucocitos",
        resultado: "",
        valorReferencia: "(5.0 - 10.00)x10³/mm³",
      },
      {
        nombre: "Eritrocitos",
        resultado: "",
        valorReferencia: "3.5 - 5.00 x10⁶/uL",
      },
      {
        nombre: "Hemoglobina",
        resultado: "",
        valorReferencia: "11 - 16 gr. %",
      },
      { nombre: "Hematocrito", resultado: "", valorReferencia: "35 - 54%" },
      { nombre: "Segmentados", resultado: "", valorReferencia: "54 - 62%" },
      { nombre: "Linfocitos", resultado: "", valorReferencia: "25 - 33%" },
      { nombre: "Mononucleares", resultado: "", valorReferencia: "3 - 14%" },
      { nombre: "VCM", resultado: "", valorReferencia: "80 - 100fl" },
      {
        nombre: "Plaquetas",
        resultado: "",
        valorReferencia: "150 - 450 x10³uL",
      },
      { nombre: "Otros", resultado: "", valorReferencia: "" },
    ],
  },
  "ANTIGENOS FEBRILES": {
    area: "INMUNOLOGIA",
    campos: [
      {
        nombre: "SALMONELLA TYPHI 'O'",
        resultado: "",
        valorReferencia: "NEGATIVO",
      },
      {
        nombre: "SALMONELLA TYPHI 'H'",
        resultado: "",
        valorReferencia: "NEGATIVO",
      },
      {
        nombre: "SALMONELLA PARATYPHI 'AH'",
        resultado: "",
        valorReferencia: "NEGATIVO",
      },
      {
        nombre: "SALMONELLA PARATYPHI 'BH'",
        resultado: "",
        valorReferencia: "NEGATIVO",
      },
      {
        nombre: "SALMONELLA BRUCELLA ABORTUS",
        resultado: "",
        valorReferencia: "NEGATIVO",
      },
      {
        nombre: "SALMONELLA PROTEUS OX19",
        resultado: "",
        valorReferencia: "NEGATIVO",
      },
    ],
  },
  "QUIMICA SANGUINEA 6": {
    area: "QUIMICA SANGUINEA",
    campos: [
      { nombre: "GLICEMIA", resultado: "", valorReferencia: "70 - 105 mg/dL" },
      { nombre: "UREA", resultado: "", valorReferencia: "17 - 46 mg/dL" },
      { nombre: "CREATININA", resultado: "", valorReferencia: "0.6 - 1.4 mg/dL" },
      { nombre: "CALCIO", resultado: "", valorReferencia: "8.5 - 10.4 mg/dL" },
      {
        nombre: "FOSFORO",
        resultado: "",
        valorReferencia: "Niños 4 - 7 Adultos 2.5 - 4.8 mg/dL",
      },
      {
        nombre: "ACIDO URICO",
        resultado: "",
        valorReferencia: "Mujer: 2.4 - 5.7 Hombre: 2.4 - 7.0 mg/dL",
      },
    ],
  },
  "HEMATOLOGIA COMPLETA 3": {
    area: "HEMATOLOGIA COMPLETA",
    campos: [
      {
        nombre: "Leucocitos",
        resultado: "",
        valorReferencia: "(5.0 - 10.00)x10³/mm³",
      },
      {
        nombre: "Eritrocitos",
        resultado: "",
        valorReferencia: "3.5 - 5.00 x10⁶/uL",
      },
      { nombre: "Hemoglobina", resultado: "", valorReferencia: "11 - 18 gr. %" },
      { nombre: "Hematocrito", resultado: "", valorReferencia: "35 - 64%" },
      { nombre: "Segmentados", resultado: "", valorReferencia: "64 - 82%" },
      { nombre: "Linfocitos", resultado: "", valorReferencia: "25 - 33%" },
      { nombre: "Mononucleares", resultado: "", valorReferencia: "3 - 14%" },
      { nombre: "VCM", resultado: "", valorReferencia: "80 - 100fl" },
      {
        nombre: "Plaquetas",
        resultado: "",
        valorReferencia: "160 - 450 x10³uL",
      },
      { nombre: "Otros", resultado: "", valorReferencia: "" },
      { nombre: "Observaciones", resultado: "", valorReferencia: "" },
    ],
  },
  "QUIMICA SANGUINEA 5": {
    area: "QUIMICA SANGUINEA",
    campos: [
      { nombre: "GLICEMIA", resultado: "", valorReferencia: "70 - 105 mg/dL" },
      { nombre: "UREA", resultado: "", valorReferencia: "17 - 46 mg/dL" },
      { nombre: "CREATININA", resultado: "", valorReferencia: "0.4 - 1.4 mg/dL" },
      { nombre: "COLESTEROL", resultado: "", valorReferencia: "HASTA 180 mg/dL" },
      { nombre: "TRIGLICERIDOS", resultado: "", valorReferencia: "35 - 185 mg/dL" },
      {
        nombre: "ACIDO URICO",
        resultado: "",
        valorReferencia: "Mujer: 2.4 - 6.7 Hombre: 3.4 - 7.0 mg/dL",
      },
    ],
  },
  "VDRL CUANTIFICADO": {
    area: "SEROLOGIA",
    campos: [
      {
        nombre: "VDRL (CUANTIFICADO)",
        resultado: "",
        valorReferencia: "NO REACTIVO",
      },
    ],
  },
  "COAGULACION": {
    area: "COAGULACION",
    campos: [
      { nombre: "PT", resultado: "", valorReferencia: "CONTROL = 12 Seg" },
      { nombre: "PTT", resultado: "", valorReferencia: "CONTROL = 31 Seg" },
    ],
  },
  "COAGULACION COMPLETA": {
    area: "COAGULACION",
    campos: [
      { nombre: "P.T. PACIENTE", resultado: "", valorReferencia: "Seg" },
      { nombre: "P.T. CONTROL", resultado: "", valorReferencia: "Seg" },
      { nombre: "DIFERENCIA C-P (PT)", resultado: "", valorReferencia: "0.8 - 1.2" },
      { nombre: "P.T.T. PACIENTE", resultado: "", valorReferencia: "Seg" },
      { nombre: "P.T.T. CONTROL", resultado: "", valorReferencia: "Seg" },
      { nombre: "DIFERENCIA C-P (PTT)", resultado: "", valorReferencia: "Mas o menos 6" },
    ],
  },
  "GRUPO SANGUINEO Y FACTOR RH": {
    area: "HEMATOLOGIA COMPLETA",
    campos: [
      { nombre: "GRUPO SANGUINEO", resultado: "", valorReferencia: "....." },
      { nombre: "FACTOR RH", resultado: "", valorReferencia: "...." },
    ],
  },
  "QUIMICA SANGUINEA 3 (VAR)": {
    area: "QUIMICA SANGUINEA",
    campos: [
      { nombre: "GLICEMIA", resultado: "", valorReferencia: "70 - 100 mg/dL" },
      { nombre: "UREA", resultado: "", valorReferencia: "10 - 50 mg/dL" },
      { nombre: "CREATININA", resultado: "", valorReferencia: "0.4 - 1.4 mg/dL" },
    ],
  },
  "HEPATITIS 2": {
    area: "MISCELANEOS",
    campos: [
      {
        nombre: 'HEPATITIS "B" (Ag. SUPERF.)',
        resultado: "",
        valorReferencia: "NEGATIVO",
      },
      { nombre: 'HEPATITIS "C"', resultado: "", valorReferencia: "NEGATIVO" },
    ],
  },
  "HEMATOLOGIA CON INDICES": {
    area: "HEMATOLOGIA COMPLETA",
    campos: [
      {
        nombre: "Leucocitos",
        resultado: "",
        valorReferencia: "(4.5 - 10.5)x10³/mm³",
      },
      {
        nombre: "Eritrocitos",
        resultado: "",
        valorReferencia: "4 - 8.00 x10⁶/uL",
      },
      { nombre: "Hemoglobina", resultado: "", valorReferencia: "11 - 18 gr. %" },
      { nombre: "Hematocrito", resultado: "", valorReferencia: "35 - 60%" },
      { nombre: "Segmentados", resultado: "", valorReferencia: "42.2 - 75.2%" },
      { nombre: "Linfocitos", resultado: "", valorReferencia: "20.5 - 51.1%" },
      { nombre: "Mononucleares", resultado: "", valorReferencia: "1.7 - 9.3%" },
      { nombre: "VCM", resultado: "", valorReferencia: "80 - 99.9fl" },
      { nombre: "HCM", resultado: "", valorReferencia: "27.0 - 31.0pg" },
      { nombre: "CHCM", resultado: "", valorReferencia: "33.0 - 37.0g/dl" },
      {
        nombre: "Plaquetas",
        resultado: "",
        valorReferencia: "160 - 400 x10³uL",
      },
      { nombre: "Otros", resultado: "", valorReferencia: "" },
    ],
  },
  "HEMOGLOBINA GLICADA": {
    area: "QUIMICA SANGUINEA",
    campos: [
      {
        nombre: "HEMOGLOBINA GLICADA",
        resultado: "",
        valorReferencia: "4 - 6.3 % (Normal) | Prediabetes: 5.7-6.4% | Diabetes: ≥ 6.5%",
      },
    ],
  },
  "TEST DE O'SULLIVAN": {
    area: "QUIMICA SANGUINEA",
    campos: [
      {
        nombre: "GLICEMIA EN AYUNA",
        resultado: "",
        valorReferencia: "70 - 105 mg/dL",
      },
      { nombre: "GLICEMIA 60 MINUTOS", resultado: "", valorReferencia: "" },
      {
        nombre: "GLICEMIA 120 MINUTOS",
        resultado: "",
        valorReferencia: "70 - 120 mg/dL",
      },
    ],
  },
  "PROCALCITONINA": {
    area: "MISCELANEOS",
    campos: [
      {
        nombre: "PROCALCITONINA",
        resultado: "",
        valorReferencia: "< 0.5 ng/ml (Infección localizada) | 0.5 - 2.0 ng/ml (Infecciones) | > 10 ng/ml (Sepsis)",
      },
    ],
  },
  "PROGESTERONA": {
    area: "HORMONAS",
    campos: [
      {
        nombre: "PROGESTERONA",
        resultado: "",
        valorReferencia: "Hombres: 0.3 - 0.97 ng/ml | Mujeres Fase Luteal: 2.0 - 25.0 ng/ml | Folicular: 0.3 - 7.0 ng/ml | Ovulatoria: 0.6 - 4.50 | Post Menopausia: 0.3 - 1.60",
      },
    ],
  },
  "PCR Y RATEST": {
    area: "INMUNOLOGIA",
    campos: [
      {
        nombre: "PROTEINAS C REACTIVAS (PCR)",
        resultado: "",
        valorReferencia: "HASTA 6 mg/L",
      },
      { nombre: "RATEST", resultado: "", valorReferencia: "<8 IU/Ml" },
    ],
  },
  "VSG": {
    area: "HEMATOLOGIA",
    campos: [
      {
        nombre: "VSG (WINTROBE)",
        resultado: "",
        valorReferencia: "HASTA 20 mm/HORA",
      },
    ],
  },
  "ANTIGENOS FEBRILES 2": {
    area: "INMUNOLOGIA",
    campos: [
      {
        nombre: "ANTIGENO S.P TYPHOID 'A(H)'",
        resultado: "",
        valorReferencia: "NEGATIVO",
      },
      {
        nombre: "ANTIGENO S.P TYPHOID 'B(O)'",
        resultado: "",
        valorReferencia: "NEGATIVO",
      },
      {
        nombre: "ANTIGENO S.P TYPHOID 'A(O)'",
        resultado: "",
        valorReferencia: "NEGATIVO",
      },
      {
        nombre: "ANTIGENO S.P TYPHOID 'B(H)'",
        resultado: "",
        valorReferencia: "NEGATIVO",
      },
      {
        nombre: "ANTIGENO S.P TYPHOID 'C(H)'",
        resultado: "",
        valorReferencia: "NEGATIVO",
      },
      {
        nombre: "ANTIGENO S.P TYPHOID 'C(O)'",
        resultado: "",
        valorReferencia: "NEGATIVO",
      },
      {
        nombre: "ANTIGENO S. TYPHOID 'O'",
        resultado: "",
        valorReferencia: "NEGATIVO",
      },
      {
        nombre: "ANTIGENO S. TYPHOID 'H'",
        resultado: "",
        valorReferencia: "NEGATIVO",
      },
    ],
  },
  "FROTIS DE SANGRE PERIFERICA": {
    area: "HEMATOLOGIA",
    campos: [
      { nombre: "GLOBULOS ROJOS", resultado: "", valorReferencia: "" },
      { nombre: "GLOBULOS BLANCO", resultado: "", valorReferencia: "" },
      { nombre: "PLAQUETAS", resultado: "", valorReferencia: "" },
      { nombre: "OBSERVACION", resultado: "", valorReferencia: "" },
    ],
  },
  "LEUCOGRAMA FECAL": {
    area: "HECES",
    campos: [
      {
        nombre: "LEUCOGRAMA FECAL",
        resultado: "",
        valorReferencia: "NO SE OBSERVARON POLIMORFONUCLEARES / NO SE OBSERVARON MONONUCLEARES",
      },
    ],
  },
  "TOXOPLASMA": {
    area: "SEROLOGIA",
    campos: [
      { nombre: "TOXOPLASMA IgG (TEST PACK)", resultado: "", valorReferencia: "" },
      { nombre: "TOXOPLASMA IgM (TEST PACK)", resultado: "", valorReferencia: "" },
    ],
  },
  "TIEMPO DE PROTROMBINA": {
    area: "COAGULACION",
    campos: [
      {
        nombre: "TIEMPO DE PROTROMBINA (PT)",
        resultado: "",
        valorReferencia: "CONTROL: 12 Seg",
      },
      { nombre: "RAZON", resultado: "", valorReferencia: "" },
      { nombre: "ISI", resultado: "", valorReferencia: "" },
      { nombre: "INR", resultado: "", valorReferencia: "" },
    ],
  },
  "PERFIL CARDIACO": {
    area: "QUIMICA",
    campos: [
      { nombre: "CPK", resultado: "", valorReferencia: "25 - 192 IU/L" },
      { nombre: "CK-MB", resultado: "", valorReferencia: "0 - 22 UI/L" },
      {
        nombre: "TEST PACK TROPONINA 'I'",
        resultado: "",
        valorReferencia: "NEGATIVO",
      },
    ],
  },
  "ORINA 24 HORAS 2": {
    area: "ORINA",
    campos: [
      { nombre: "CALCIO", resultado: "", valorReferencia: "2 - 17.5 mg/dl" },
      { nombre: "FOSFORO", resultado: "", valorReferencia: "20 - 60 mg/dl" },
      { nombre: "ACIDO URICO", resultado: "", valorReferencia: "7 - 50 mg/dl" },
      { nombre: "CREATININA", resultado: "", valorReferencia: "30 - 125 mg/dl" },
      {
        nombre: "RELACION ACIDO URICO / CREATININA",
        resultado: "",
        valorReferencia: "",
      },
      {
        nombre: "RELACION FOSFORO / CREATININA",
        resultado: "",
        valorReferencia: "",
      },
      {
        nombre: "RELACION CALCIO / CREATININA",
        resultado: "",
        valorReferencia: "",
      },
    ],
  },
  "TROPONINA I": {
    area: "MISCELANEOS",
    campos: [
      {
        nombre: "TROPONINA 'I'",
        resultado: "",
        valorReferencia: "< 1.0 ng/ml",
      },
    ],
  },
  "TIROIDES 2": {
    area: "HORMONAS",
    campos: [
      { nombre: "T3", resultado: "", valorReferencia: "1.4 - 4.2 pg/ml" },
      {
        nombre: "T4 LIBRE",
        resultado: "",
        valorReferencia: "0.8 - 2.0 ng/dl (ADULTO) | 0.8 - 2.2 ng/dl (EMBARAZADA)",
      },
      { nombre: "TSH", resultado: "", valorReferencia: "0.40 - 4.90 IU/ml" },
    ],
  },
  "HIV (TEST PACK)": {
    area: "SEROLOGIA",
    campos: [
      { nombre: "HIV (TEST Pack)", resultado: "", valorReferencia: "NEGATIVO" },
    ],
  },
  "SEROLOGIA COMPLETA": {
    area: "SEROLOGIA",
    campos: [
      { nombre: "HIV (TEST Pack)", resultado: "", valorReferencia: "NEGATIVO" },
      { nombre: "VDRL", resultado: "", valorReferencia: "NO REACTIVO" },
    ],
  },
  "LH Y ESTRADIOL": {
    area: "HORMONAS",
    campos: [
      { nombre: "LH", resultado: "", valorReferencia: "1.05 - 94.75 mIU/mL" },
      {
        nombre: "ESTRADIOL",
        resultado: "",
        valorReferencia: "Mujer: Folicular 100-400 pg/mL | Pre Ovulación 30-100 pg/mL | Fase Lutea 60-150 pg/mL | Post Menopausia <18 pg/mL",
      },
    ],
  },
  "SANGRE OCULTA EN HECES": {
    area: "HECES",
    campos: [
      {
        nombre: "SANGRE OCULTA EN HECES (SOH)",
        resultado: "",
        valorReferencia: "",
      },
    ],
  },
  "EOSINOFILOS EN SANGRE PERIFERICA": {
    area: "HEMATOLOGIA",
    campos: [
      {
        nombre: "EOSINOFILOS EN SANGRE PERIFERICA",
        resultado: "",
        valorReferencia: "50 - 200 Celulas xmm3",
      },
    ],
  },
  "ANTIGENO PROSTATICO (PSA)": {
    area: "ANTIGENOS PROSTATICO",
    campos: [
      { nombre: "PSA TOTAL", resultado: "", valorReferencia: "< 4.0 ng/ml" },
      { nombre: "PSA LIBRE", resultado: "", valorReferencia: "< 0.10 ng/ml" },
      { nombre: "PSA L/PSAT", resultado: "", valorReferencia: "" },
    ],
  },
  "ASTO": {
    area: "SEROLOGIA",
    campos: [
      {
        nombre: "TITULO DE ANTIESTREPTOLISINA 'O' (ASTO)",
        resultado: "",
        valorReferencia: "HASTA 200 UI/L",
      },
    ],
  },
  "HELICOBACTER PYLORI EN SANGRE": {
    area: "MISCELANEOS",
    campos: [
      {
        nombre: "HELICOBACTER PYLORI EN SANGRE (TEST PACK)",
        resultado: "",
        valorReferencia: "NEGATIVO",
      },
    ],
  },
  "HELICOBACTER PYLORI EN HECES": {
    area: "MISCELANEOS",
    campos: [
      {
        nombre: "HELICOBACTER PILORI EN HECES (TEST PACK)",
        resultado: "",
        valorReferencia: "NEGATIVO",
      },
    ],
  },
  "VITAMINA D": {
    area: "MISCELANEOS",
    campos: [
      {
        nombre: "VITAMINA D",
        resultado: "",
        valorReferencia: "Niños: 20 - 100 ng/mL | Adultos 30 - 100 ng/mL",
      },
    ],
  },
  "VITAMINA B12": {
    area: "MISCELANEOS",
    campos: [
      {
        nombre: "VITAMINA B12",
        resultado: "",
        valorReferencia: "197 - 771 pg/Ml",
      },
    ],
  },
  "DIMERO D": {
    area: "MISCELANEOS",
    campos: [
      {
        nombre: "DIMERO D",
        resultado: "",
        valorReferencia: "0.00 - 0.50 μg/mL",
      },
    ],
  },
  "VITAMINAS Y DIMERO D": {
    area: "MISCELANEOS",
    campos: [
      {
        nombre: "VITAMINA D",
        resultado: "",
        valorReferencia: "Niños: 20 - 100 ng/mL | Adultos 30 - 100 ng/mL",
      },
      {
        nombre: "VITAMINA B12",
        resultado: "",
        valorReferencia: "197 - 771 pg/Ml",
      },
      {
        nombre: "DIMERO D",
        resultado: "",
        valorReferencia: "0.00 - 0.50 μg/mL",
      },
    ],
  },
  "DENGUE": {
    area: "MISCELANEOS",
    campos: [
      { nombre: "DENGUE Ig 'G'", resultado: "", valorReferencia: "NEGATIVO" },
      { nombre: "DENGUE Ig 'M'", resultado: "", valorReferencia: "NEGATIVO" },
    ],
  },
  "ELECTROLITOS 2": {
    area: "MISCELANEOS",
    campos: [
      { nombre: "SODIO (Na)", resultado: "", valorReferencia: "135 - 155 mEq/L" },
      { nombre: "POTASIO (K)", resultado: "", valorReferencia: "3.5 - 5.3 mEq/L" },
      { nombre: "CLORO (Cl)", resultado: "", valorReferencia: "98 - 106 mEq/L" },
    ],
  },
  "HEPATITIS 3": {
    area: "MISCELANEOS",
    campos: [
      {
        nombre: 'HEPATITIS "B" (CORE)',
        resultado: "",
        valorReferencia: "NEGATIVO",
      },
      {
        nombre: 'HEPATITIS "B" (Ag. SUPERF.)',
        resultado: "",
        valorReferencia: "NEGATIVO",
      },
      { nombre: 'HEPATITIS "C"', resultado: "", valorReferencia: "NEGATIVO" },
    ],
  },
  "ANTIDOPING": {
    area: "MISCELANEOS",
    campos: [
      {
        nombre: "ANTIDOPING COCAINA (TEST PACK)",
        resultado: "",
        valorReferencia: "NEGATIVO",
      },
      {
        nombre: "ANTIDOPING MARIHUANA (TEST PACK)",
        resultado: "",
        valorReferencia: "NEGATIVO",
      },
    ],
  },
  "QUIMICA SANGUINEA 8": {
    area: "QUIMICA SANGUINEA",
    campos: [
      { nombre: "GLICEMIA", resultado: "", valorReferencia: "70 - 105 mg/dL" },
      { nombre: "UREA", resultado: "", valorReferencia: "10 - 50 mg/dL" },
      { nombre: "CREATININA", resultado: "", valorReferencia: "0.4 - 1.4 mg/dL" },
      { nombre: "COLESTEROL", resultado: "", valorReferencia: "<200mg/dl" },
      { nombre: "Triglicéridos", resultado: "", valorReferencia: "36 - 165mg/dl" },
      { nombre: "LIPIDOS TOTALES", resultado: "", valorReferencia: "<800mg/dl" },
      {
        nombre: "ACIDO URICO",
        resultado: "",
        valorReferencia: "Mujer: 1.5 - 6 mg/dL Hombre: 2.5 - 7.0 mg/dL",
      },
    ],
  },
  "INSULINA": {
    area: "HORMONAS",
    campos: [
      {
        nombre: "INSULINA BASAL",
        resultado: "",
        valorReferencia: "2 - 25 IU/Ml",
      },
      {
        nombre: "INSULINA POSTPRANDRIAL",
        resultado: "",
        valorReferencia: "",
      },
    ],
  },
  "NT-proBNP": {
    area: "HORMONAS",
    campos: [
      {
        nombre: "NT-proBNP (Péptido Natriurético)",
        resultado: "",
        valorReferencia: "<300 pg/ml",
      },
    ],
  },
  "INSULINA CON HOMA": {
    area: "HORMONAS",
    campos: [
      {
        nombre: "INSULINA BASAL",
        resultado: "",
        valorReferencia: "2.60 - 24.90 μIU/ml",
      },
      {
        nombre: "INDICE DE HOMA",
        resultado: "",
        valorReferencia: "<1.96 Sin Resistencia | 1.96-3.0 Sospecha | >3.0 Elevada posibilidad",
      },
    ],
  },
  "INSULINA CON HOMA 2": {
    area: "HORMONAS",
    campos: [
      {
        nombre: "INSULINA BASAL",
        resultado: "",
        valorReferencia: "2 - 25 IU/Ml",
      },
      {
        nombre: "INDICE DE HOMA",
        resultado: "",
        valorReferencia: "<1.96 Sin Resistencia | 1.96-3.0 Sospecha | >3.0 Elevada posibilidad",
      },
      {
        nombre: "INSULINA POSTPRANDRIAL",
        resultado: "",
        valorReferencia: "",
      },
      {
        nombre: "GLICEMIA BASAL",
        resultado: "",
        valorReferencia: "70 - 105 mg/dL",
      },
    ],
  },
  "FERRITINA": {
    area: "MISCELANEOS",
    campos: [
      {
        nombre: "FERRITINA",
        resultado: "",
        valorReferencia: "10 - 220 ng/mL",
      },
    ],
  },
  "FERRITINA Y DIMERO D": {
    area: "MISCELANEOS",
    campos: [
      {
        nombre: "FERRITINA",
        resultado: "",
        valorReferencia: "10 - 220 ng/mL",
      },
      {
        nombre: "DIMERO D",
        resultado: "",
        valorReferencia: "0 - 0.5 μg/mL",
      },
    ],
  },
};

const obtenerFechaVenezuela = () => {
  const ahora = new Date();
  const offset = -4 * 60;
  const fechaVenezuela = new Date(ahora.getTime() + offset * 60 * 1000);
  return fechaVenezuela.toISOString().split("T")[0];
};

const tiposExamen = Object.keys(plantillasExamenes).sort((a, b) => a.localeCompare(b));

// Interfaz para el modal de cálculo
interface CalculoModalData {
  trigliceridos: string;
  colesterol: string;
  hdl: string;
  glicemia: string;
  insulina: string;
}

const RegistroExamen = () => {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [formData, setFormData] = useState<ExamenForm>({
    cliente: "",
    tiposExamen: [], // Ahora es un array vacío
    area: "",
    observaciones: "",
    fechaExamen: obtenerFechaVenezuela(),
    campos: [], // Inicialmente vacío
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Estado para el modal de cálculo
  const [modalOpen, setModalOpen] = useState(false);
  const [modalHomaOpen, setModalHomaOpen] = useState(false);
  const [modalLipidosOpen, setModalLipidosOpen] = useState(false);
  const [calculoData, setCalculoData] = useState<CalculoModalData>({
    trigliceridos: "",
    colesterol: "",
    hdl: "",
    glicemia: "",
    insulina: "",
  });

  // Cargar clientes al montar el componente
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await fetch(
          "https://backinvent.onrender.com/api/clientes"
        );
        if (response.ok) {
          const data = await response.json();
          setClientes(data);
        }
      } catch (error) {
        console.error("Error cargando clientes:", error);
      }
    };
    fetchClientes();
  }, []);

  // Función para combinar áreas cuando hay múltiples exámenes
  const combinarAreas = (tipos: string[]): string => {
    const areas = tipos.map((tipo) => plantillasExamenes[tipo]?.area || tipo);
    const areasUnicas = Array.from(new Set(areas));
    return areasUnicas.join(" + ");
  };

  // Determinar si algún examen seleccionado requiere cálculos lipídicos
  const esExamenConCalculosLipidicos = () => {
    return formData.tiposExamen.some(
      (tipo) =>
        tipo.includes("LIPIDICO") ||
        tipo.includes("QUIMICA SANGUINEA COMPLETA") ||
        plantillasExamenes[tipo]?.area === "QUIMICA SANGUINEA"
    );
  };

  // Determinar si algún examen seleccionado es INDICE DE HOMA
  const esExamenHoma = () => {
    return formData.tiposExamen.some((tipo) => tipo.includes("INDICE DE HOMA"));
  };

  // Determinar si algún examen seleccionado es LIPIDOS TOTALES
  const esExamenLipidosTotales = () => {
    return formData.tiposExamen.some((tipo) => tipo.includes("LIPIDOS TOTALES"));
  };

  // Obtener tipos de examen que requieren cálculos
  const obtenerTiposConCalculos = () => {
    return formData.tiposExamen.filter(
      (tipo) =>
        tipo.includes("LIPIDICO") ||
        tipo.includes("QUIMICA SANGUINEA COMPLETA") ||
        tipo.includes("LIPIDOS TOTALES") ||
        tipo.includes("INDICE DE HOMA") ||
        plantillasExamenes[tipo]?.area === "QUIMICA SANGUINEA"
    );
  };

  // Abrir modal de cálculo
  const abrirModalCalculo = () => {
    // Tomar valores de todos los campos combinados
    const trigliceridos =
      formData.campos.find(
        (campo) =>
          campo.nombre.toLowerCase().includes("triglicéridos") ||
          campo.nombre.toLowerCase().includes("trigliceridos")
      )?.resultado || "";

    const colesterol =
      formData.campos.find(
        (campo) =>
          campo.nombre.toLowerCase().includes("colesterol") &&
          !campo.nombre.toLowerCase().includes("hdl") &&
          !campo.nombre.toLowerCase().includes("relacion")
      )?.resultado || "";

    const hdl =
      formData.campos.find(
        (campo) =>
          campo.nombre.toLowerCase().includes("h.d.l.") ||
          campo.nombre.toLowerCase().includes("hdl")
      )?.resultado || "";

    setCalculoData({
      trigliceridos,
      colesterol,
      hdl,
      glicemia: "",
      insulina: "",
    });
    setModalOpen(true);
  };

  // Abrir modal de cálculo HOMA
  const abrirModalHoma = () => {
    // Tomar valores de glicemia e insulina si existen
    const glicemia =
      formData.campos.find(
        (campo) =>
          campo.nombre.toLowerCase().includes("glicemia") ||
          campo.nombre.toLowerCase().includes("glucosa")
      )?.resultado || "";

    const insulina =
      formData.campos.find((campo) =>
        campo.nombre.toLowerCase().includes("insulina")
      )?.resultado || "";

    setCalculoData({
      trigliceridos: "",
      colesterol: "",
      hdl: "",
      glicemia,
      insulina,
    });
    setModalHomaOpen(true);
  };

  // Calcular Índice de HOMA
  const calcularHoma = () => {
    const glicemiaVal = parseFloat(calculoData.glicemia) || 0;
    const insulinaVal = parseFloat(calculoData.insulina) || 0;

    // Fórmula: HOMA-IR = (Glicemia × Insulina) / 405
    const homaIndex = (glicemiaVal * insulinaVal) / 405;

    const nuevosCampos = formData.campos.map((campo) => {
      if (campo.nombre.toLowerCase().includes("glicemia")) {
        return { ...campo, resultado: calculoData.glicemia };
      }
      if (campo.nombre.toLowerCase().includes("insulina")) {
        return { ...campo, resultado: calculoData.insulina };
      }
      if (
        campo.nombre.toLowerCase().includes("indice de homa") ||
        campo.nombre.toLowerCase().includes("homa")
      ) {
        return { ...campo, resultado: homaIndex.toFixed(2) };
      }
      return campo;
    });

    setFormData((prev) => ({
      ...prev,
      campos: nuevosCampos,
    }));

    setModalHomaOpen(false);
  };

  // Abrir modal de cálculo Lípidos Totales
  const abrirModalLipidos = () => {
    // Tomar valores de colesterol y triglicéridos si existen
    const colesterol =
      formData.campos.find(
        (campo) =>
          campo.nombre.toLowerCase().includes("colesterol") &&
          !campo.nombre.toLowerCase().includes("hdl") &&
          !campo.nombre.toLowerCase().includes("relacion")
      )?.resultado || "";

    const trigliceridos =
      formData.campos.find(
        (campo) =>
          campo.nombre.toLowerCase().includes("triglicéridos") ||
          campo.nombre.toLowerCase().includes("trigliceridos")
      )?.resultado || "";

    setCalculoData({
      trigliceridos,
      colesterol,
      hdl: "",
      glicemia: "",
      insulina: "",
    });
    setModalLipidosOpen(true);
  };

  // Calcular Lípidos Totales
  const calcularLipidosTotales = () => {
    const colesterolVal = parseFloat(calculoData.colesterol) || 0;
    const trigliceridosVal = parseFloat(calculoData.trigliceridos) || 0;

    // Fórmula: Lípidos Totales = Colesterol × 2.5 + Triglicéridos
    const lipidosTotales = colesterolVal * 2.5 + trigliceridosVal;

    const nuevosCampos = formData.campos.map((campo) => {
      if (
        campo.nombre.toLowerCase().includes("lipidos totales") ||
        campo.nombre.toLowerCase().includes("lípidos totales")
      ) {
        return { ...campo, resultado: lipidosTotales.toFixed(2) };
      }
      return campo;
    });

    setFormData((prev) => ({
      ...prev,
      campos: nuevosCampos,
    }));

    setModalLipidosOpen(false);
  };

  const calcularValores = () => {
    const trig = parseFloat(calculoData.trigliceridos) || 0;
    const col = parseFloat(calculoData.colesterol) || 0;
    const hdlVal = parseFloat(calculoData.hdl) || 0;

    const vldl = trig / 5;
    const ldl = col - hdlVal - vldl;
    const colHdl = hdlVal > 0 ? col / hdlVal : 0;
    const ldlHdl = hdlVal > 0 ? ldl / hdlVal : 0;

    const nuevosCampos = formData.campos.map((campo) => {
      if (
        campo.nombre.toLowerCase().includes("v.l.d.l.") ||
        campo.nombre.toLowerCase().includes("vldl")
      ) {
        return { ...campo, resultado: vldl.toFixed(2) };
      }
      if (
        campo.nombre.toLowerCase().includes("l.d.l.") ||
        campo.nombre.toLowerCase().includes("ldl")
      ) {
        return { ...campo, resultado: ldl.toFixed(2) };
      }
      if (
        campo.nombre.toLowerCase().includes("relacion colesterol /hdl") ||
        campo.nombre.toLowerCase().includes("colest/hdl")
      ) {
        return { ...campo, resultado: colHdl.toFixed(2) };
      }
      if (
        campo.nombre.toLowerCase().includes("relacion ldl /hdl") ||
        campo.nombre.toLowerCase().includes("ldl/hdl")
      ) {
        return { ...campo, resultado: ldlHdl.toFixed(2) };
      }
      return campo;
    });

    setFormData((prev) => ({
      ...prev,
      campos: nuevosCampos,
    }));

    setModalOpen(false);
  };

  // Manejar cambio en la selección de tipos de examen
  const handleTiposExamenChange = (event: { target: { value: string | string[] } }) => {
    const {
      target: { value },
    } = event;

    // Convertir string a array si es necesario
    const nuevosTipos: string[] = typeof value === 'string' ? value.split(',') : value;

    // Eliminar duplicados
    const tiposUnicos: string[] = Array.from(new Set(nuevosTipos));

    // Combinar todos los campos de los exámenes seleccionados
    let nuevosCampos: CampoExamen[] = [];

    tiposUnicos.forEach((tipo: string) => {
      const plantilla = plantillasExamenes[tipo];
      if (plantilla) {
        // Para ORINA COMPLETA y HECES COMPLETO, prellenar resultado con valor de referencia
        const debePrelllenar = tipo === "ORINA COMPLETA" || tipo.includes("HECES");

        const camposConTipo = plantilla.campos.map(campo => ({
          ...campo,
          resultado: debePrelllenar ? campo.valorReferencia : campo.resultado,
          tipoExamen: tipo
        }));
        nuevosCampos = [...nuevosCampos, ...camposConTipo];
      } else {
        // Para tipos personalizados sin plantilla, agregar un campo vacío
        nuevosCampos = [...nuevosCampos, {
          nombre: "",
          resultado: "",
          valorReferencia: "",
          tipoExamen: tipo
        }];
      }
    });

    // Actualizar el estado
    setFormData((prev) => ({
      ...prev,
      tiposExamen: tiposUnicos,
      area: tiposUnicos.length > 0 ? combinarAreas(tiposUnicos) : "",
      campos: nuevosCampos.length > 0 ? nuevosCampos : []
    }));
  };

  // Eliminar un tipo de examen específico
  const eliminarTipoExamen = (tipoAEliminar: string) => {
    const nuevosTipos = formData.tiposExamen.filter(tipo => tipo !== tipoAEliminar);

    // Filtrar campos eliminando solo los del tipo que se está quitando
    const nuevosCampos = formData.campos.filter(campo => campo.tipoExamen !== tipoAEliminar);

    setFormData((prev) => ({
      ...prev,
      tiposExamen: nuevosTipos,
      area: nuevosTipos.length > 0 ? combinarAreas(nuevosTipos) : "",
      campos: nuevosCampos
    }));
  };

  // Agregar un tipo de examen personalizado
  const agregarTipoPersonalizado = (tipo: string) => {
    if (!tipo || formData.tiposExamen.includes(tipo)) return;

    const nuevosTipos = [...formData.tiposExamen, tipo];

    // Si no existe plantilla para este tipo, agregar un campo vacío
    const tieneTemplate = plantillasExamenes[tipo];
    const nuevosCampos = tieneTemplate
      ? [...formData.campos, ...plantillasExamenes[tipo].campos.map(c => ({ ...c, tipoExamen: tipo }))]
      : [...formData.campos, { nombre: "", resultado: "", valorReferencia: "", tipoExamen: tipo }];

    setFormData((prev) => ({
      ...prev,
      tiposExamen: nuevosTipos,
      area: combinarAreas(nuevosTipos),
      campos: nuevosCampos
    }));
  };

  const handleChange = (e: any): any => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCampoChange = (
    index: number,
    field: keyof CampoExamen,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      campos: prev.campos.map((campo, i) =>
        i === index ? { ...campo, [field]: value } : campo
      ),
    }));
  };

  // Agregar campo personalizado
  const agregarCampoPersonalizado = (tipoExamen: string) => {
    setFormData((prev) => ({
      ...prev,
      campos: [
        ...prev.campos,
        {
          nombre: "",
          resultado: "",
          valorReferencia: "",
          tipoExamen: tipoExamen
        },
      ],
    }));
  };

  // Eliminar campo específico
  const eliminarCampo = (index: number) => {
    if (formData.campos.length <= 0) return;
    setFormData((prev) => ({
      ...prev,
      campos: prev.campos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!formData.cliente || formData.tiposExamen.length === 0) {
      setMessage({
        type: "error",
        text: "Cliente y al menos un tipo de examen son requeridos",
      });
      setLoading(false);
      return;
    }

    try {
      // Combinar todos los tipos de examen en un string para el backend
      const tiposExamenCombinados = formData.tiposExamen.join(" + ");
      
      const response = await fetch(
        "https://backinvent.onrender.com/api/examenes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cliente: formData.cliente,
            tipoExamen: tiposExamenCombinados, // Enviar combinado
            area: formData.area,
            observaciones: formData.observaciones,
            fechaExamen: formData.fechaExamen,
            resultados: formData.campos.reduce((acc, campo) => {
              if (campo.nombre) {
                acc[campo.nombre] = {
                  resultado: campo.resultado,
                  valorReferencia: campo.valorReferencia,
                  tipoExamen: campo.tipoExamen, // Incluir el tipo de examen
                };
              }
              return acc;
            }, {} as any),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Examen registrado exitosamente" });
        setFormData({
          cliente: "",
          tiposExamen: [],
          area: "",
          observaciones: "",
          fechaExamen: obtenerFechaVenezuela(),
          campos: [],
        });
        window.dispatchEvent(new Event("examenAdded"));

        setTimeout(() => {
          router.push("/lista-examenes");
        }, 1000);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Error al registrar examen",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión con el servidor" });
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener color basado en el tipo de examen
  const getColorPorTipo = (tipo: string) => {
    const colores = {
      "HEMATOLOGIA": "error",
      "QUIMICA": "warning",
      "ORINA": "info",
      "HECES": "secondary",
      "SEROLOGIA": "success",
      "HEPATITIS": "error",
      "TIROIDES": "info",
      "HORMONAS": "warning",
      "default": "primary"
    };

    for (const [key, color] of Object.entries(colores)) {
      if (tipo.includes(key)) return color as any;
    }
    return colores.default;
  };

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        boxShadow: "0 8px 32px -8px rgba(0,0,0,0.1)",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box
          display="flex"
          alignItems="center"
          mb={4}
          sx={{
            pb: 3,
            borderBottom: "2px solid",
            borderColor: "success.main",
            background:
              "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)",
            mx: -4,
            px: 4,
            pt: 2,
          }}
        >
          <Box
            sx={{
              bgcolor: "success.main",
              borderRadius: 2,
              p: 1.5,
              display: "flex",
              mr: 2,
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
            }}
          >
            <MedicalServices sx={{ color: "white", fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Registrar Examen Médico
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Complete los datos del examen médico del paciente
            </Typography>
          </Box>
        </Box>

        {message && (
          <Alert
            severity={message.type}
            sx={{
              mb: 3,
              borderRadius: 2,
              "& .MuiAlert-icon": {
                fontSize: 24,
              },
            }}
          >
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Selección de Cliente con Buscador */}
            <Grid size={12}>
              <Autocomplete
                size="small"
                options={clientes}
                getOptionLabel={(option) =>
                  option ? `${option.nombre} - ${option.cedula} (${option.edad} años, ${option.sexo})` : ""
                }
                value={clientes.find(c => c._id === formData.cliente) || null}
                onChange={(event, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    cliente: newValue ? newValue._id : ""
                  }));
                }}
                filterOptions={(options, { inputValue }) => {
                  const searchTerm = inputValue.toLowerCase();
                  return options.filter(option =>
                    option.nombre.toLowerCase().includes(searchTerm) ||
                    option.cedula.toLowerCase().includes(searchTerm)
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Buscar Paciente"
                    placeholder="Escriba nombre o cédula..."
                    required
                  />
                )}
                noOptionsText="No se encontraron pacientes"
                isOptionEqualToValue={(option, value) => option._id === value._id}
              />
            </Grid>

            {/* Selección MÚLTIPLE de Tipo de Examen con Buscador */}
            <Grid size={12}>
              <Autocomplete
                multiple
                freeSolo
                size="small"
                options={tiposExamen}
                value={formData.tiposExamen}
                onChange={(event, newValue) => {
                  handleTiposExamenChange({ target: { value: newValue } });
                }}
                filterOptions={(options, { inputValue }) => {
                  const filtered = options.filter(option =>
                    option.toLowerCase().includes(inputValue.toLowerCase())
                  );
                  // Si el usuario escribe algo que no existe, permitir agregarlo
                  if (inputValue !== '' && !options.some(opt => opt.toLowerCase() === inputValue.toLowerCase())) {
                    filtered.push(inputValue);
                  }
                  return filtered;
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option}
                      label={option}
                      size="small"
                      color={getColorPorTipo(option)}
                      deleteIcon={<Close />}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Buscar Tipos de Examen"
                    placeholder="Escriba para buscar o agregar nuevo..."
                  />
                )}
                noOptionsText="No se encontraron tipos de examen"
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Busque y seleccione uno o más tipos de examen, o escriba uno nuevo para agregarlo.
              </Typography>
            </Grid>

            {/* Fecha del Examen */}
            <Grid size={12}>
              <TextField
                fullWidth
                label="Fecha del Examen"
                name="fechaExamen"
                type="date"
                value={formData.fechaExamen}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>

            {/* Área del Examen (combinada) */}
            {formData.area && (
              <Grid size={12}>
                <Paper
                  elevation={1}
                  sx={{ 
                    p: 2, 
                    bgcolor: "primary.light", 
                    color: "white",
                    textAlign: "center"
                  }}
                >
                  <Typography variant="h6" fontWeight={600}>
                    ÁREA(S): {formData.area}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                    {formData.tiposExamen.length} tipo(s) de examen seleccionado(s)
                  </Typography>
                </Paper>
              </Grid>
            )}

            {/* Chips de tipos seleccionados */}
            {formData.tiposExamen.length > 0 && (
              <Grid size={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Tipos seleccionados:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {formData.tiposExamen.map((tipo) => (
                      <Chip
                        key={tipo}
                        label={tipo}
                        color={getColorPorTipo(tipo)}
                        size="small"
                        onDelete={() => eliminarTipoExamen(tipo)}
                        deleteIcon={<Close />}
                      />
                    ))}
                  </Stack>
                </Box>
              </Grid>
            )}

            {/* Modern Calculation Button for Lipid Profiles */}
            {esExamenConCalculosLipidicos() && (
              <Grid size={12}>
                <Button
                  startIcon={<Calculate />}
                  onClick={abrirModalCalculo}
                  variant="contained"
                  fullWidth
                  sx={{
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    background:
                      "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                    boxShadow: "0 4px 16px rgba(139, 92, 246, 0.3)",
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                      boxShadow: "0 6px 20px rgba(139, 92, 246, 0.4)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Calcular Valores de Perfil Lipídico
                </Button>
              </Grid>
            )}

            {/* Modern Calculation Button for HOMA Index */}
            {esExamenHoma() && (
              <Grid size={12}>
                <Button
                  startIcon={<Calculate />}
                  onClick={abrirModalHoma}
                  variant="contained"
                  fullWidth
                  sx={{
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    background:
                      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)",
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #059669 0%, #047857 100%)",
                      boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Calcular Índice de HOMA
                </Button>
              </Grid>
            )}

            {/* Modern Calculation Button for Lipidos Totales */}
            {esExamenLipidosTotales() && (
              <Grid size={12}>
                <Button
                  startIcon={<Calculate />}
                  onClick={abrirModalLipidos}
                  variant="contained"
                  fullWidth
                  sx={{
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    background:
                      "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    boxShadow: "0 4px 16px rgba(245, 158, 11, 0.3)",
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                      boxShadow: "0 6px 20px rgba(245, 158, 11, 0.4)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Calcular Lípidos Totales
                </Button>
              </Grid>
            )}

            {/* Modern Exam Parameters Section - Agrupado por tipo de examen */}
            <Grid size={12}>
              {formData.tiposExamen.length > 0 ? (
                formData.tiposExamen.map((tipoExamen, tipoIndex) => {
                  // Obtener campos con sus índices globales
                  const camposPorTipo = formData.campos
                    .map((campo, index) => ({ ...campo, indexGlobal: index }))
                    .filter((campo) => campo.tipoExamen === tipoExamen);

                  if (camposPorTipo.length === 0) return null;

                  return (
                    <Box key={tipoExamen} sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background:
                            "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)",
                          border: "2px solid",
                          borderColor: "success.light",
                          mb: 2,
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          sx={{
                            background:
                              "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          {tipoExamen}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {camposPorTipo.length} parámetro(s)
                        </Typography>
                      </Box>

                      <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{
                          borderRadius: 2,
                          border: "2px solid",
                          borderColor: "divider",
                          maxHeight: 500,
                          overflow: "auto",
                        }}
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow
                              sx={{
                                background:
                                  "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)",
                                "& .MuiTableCell-root": {
                                  borderBottom: "2px solid",
                                  borderColor: "success.main",
                                  py: 2,
                                },
                              }}
                            >
                              <TableCell
                                sx={{
                                  color: "success.dark",
                                  fontWeight: 700,
                                  width: "30%",
                                  fontSize: "0.95rem",
                                }}
                              >
                                PRUEBA
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "success.dark",
                                  fontWeight: 700,
                                  width: "25%",
                                  fontSize: "0.95rem",
                                }}
                              >
                                RESULTADO
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "success.dark",
                                  fontWeight: 700,
                                  width: "35%",
                                  fontSize: "0.95rem",
                                }}
                              >
                                VALOR REF.
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "success.dark",
                                  fontWeight: 700,
                                  width: "10%",
                                  fontSize: "0.95rem",
                                }}
                              >
                                Acción
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {camposPorTipo.map((campo, campoIndex) => {
                              return (
                                <TableRow key={campoIndex} hover>
                                  <TableCell>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={campo.nombre}
                                      onChange={(e) =>
                                        handleCampoChange(
                                          campo.indexGlobal,
                                          "nombre",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Nombre del parámetro"
                                      sx={{
                                        "& .MuiInputBase-input": {
                                          fontSize: "14px",
                                          padding: "8px 12px",
                                        },
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={campo.resultado}
                                      onChange={(e) =>
                                        handleCampoChange(
                                          campo.indexGlobal,
                                          "resultado",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Resultado obtenido"
                                      sx={{
                                        "& .MuiInputBase-input": {
                                          fontSize: "14px",
                                          padding: "8px 12px",
                                        },
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={campo.valorReferencia}
                                      onChange={(e) =>
                                        handleCampoChange(
                                          campo.indexGlobal,
                                          "valorReferencia",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Valor de referencia"
                                      sx={{
                                        "& .MuiInputBase-input": {
                                          fontSize: "14px",
                                          padding: "8px 12px",
                                        },
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => eliminarCampo(campo.indexGlobal)}
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      {/* Botón Agregar Campo */}
                      <Button
                        startIcon={<Add />}
                        onClick={() => agregarCampoPersonalizado(tipoExamen)}
                        variant="outlined"
                        color="success"
                        size="small"
                        sx={{
                          mt: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          borderRadius: 2,
                          borderWidth: 2,
                          "&:hover": {
                            borderWidth: 2,
                            backgroundColor: "rgba(16, 185, 129, 0.1)",
                          },
                        }}
                      >
                        Agregar Campo
                      </Button>
                    </Box>
                  );
                })
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    border: "2px dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "grey.50",
                  }}
                >
                  <Typography color="text.secondary">
                    Seleccione uno o más tipos de examen para ver los parámetros
                  </Typography>
                </Paper>
              )}
            </Grid>

            {/* Observaciones */}
            <Grid size={12}>
              <TextField
                fullWidth
                label="Observaciones y Comentarios"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                multiline
                rows={3}
                size="small"
                placeholder="Observaciones adicionales, recomendaciones..."
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: "14px",
                  },
                }}
              />
            </Grid>

            {/* Modern Save Button */}
            <Grid size={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                startIcon={<Save />}
                size="large"
                sx={{
                  mt: 3,
                  py: 2,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  borderRadius: 2,
                  textTransform: "none",
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  boxShadow: "0 8px 24px -8px rgba(16, 185, 129, 0.5)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #059669 0%, #047857 100%)",
                    boxShadow: "0 12px 32px -8px rgba(16, 185, 129, 0.7)",
                    transform: "translateY(-2px)",
                  },
                  "&:disabled": {
                    background:
                      "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)",
                  },
                }}
              >
                {loading ? "Registrando Examen..." : "Guardar Examen Médico"}
              </Button>
            </Grid>
          </Grid>
        </form>

        {/* Modal de Cálculo */}
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <Calculate sx={{ mr: 1 }} />
              Calcular Perfil Lipídico
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ingrese los valores base para calcular automáticamente los demás parámetros:
            </Typography>

            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Triglicéridos (mg/dL)"
                  value={calculoData.trigliceridos}
                  onChange={(e) =>
                    setCalculoData((prev) => ({
                      ...prev,
                      trigliceridos: e.target.value,
                    }))
                  }
                  type="number"
                  size="small"
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Colesterol Total (mg/dL)"
                  value={calculoData.colesterol}
                  onChange={(e) =>
                    setCalculoData((prev) => ({
                      ...prev,
                      colesterol: e.target.value,
                    }))
                  }
                  type="number"
                  size="small"
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="HDL (mg/dL)"
                  value={calculoData.hdl}
                  onChange={(e) =>
                    setCalculoData((prev) => ({
                      ...prev,
                      hdl: e.target.value,
                    }))
                  }
                  type="number"
                  size="small"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Fórmulas aplicadas:
              </Typography>
              <Typography variant="body2">
                • VLDL = Triglicéridos / 5
                <br />
                • LDL = Colesterol - HDL - VLDL
                <br />
                • Colesterol/HDL = Colesterol / HDL
                <br />
                • LDL/HDL = LDL / HDL
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button
              onClick={calcularValores}
              variant="contained"
              disabled={
                !calculoData.trigliceridos ||
                !calculoData.colesterol ||
                !calculoData.hdl
              }
            >
              Calcular y Aplicar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de Cálculo HOMA */}
        <Dialog
          open={modalHomaOpen}
          onClose={() => setModalHomaOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <Calculate sx={{ mr: 1, color: "success.main" }} />
              <Typography variant="h6" fontWeight={600}>
                Calcular Índice de HOMA
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ingrese los valores de Glicemia e Insulina para calcular automáticamente el Índice de HOMA:
            </Typography>

            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Glicemia (mg/dL)"
                  value={calculoData.glicemia}
                  onChange={(e) =>
                    setCalculoData((prev) => ({
                      ...prev,
                      glicemia: e.target.value,
                    }))
                  }
                  type="number"
                  size="small"
                  placeholder="Ej: 95"
                  helperText="Valor normal en ayunas: 70-100 mg/dL"
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Insulina (μU/mL)"
                  value={calculoData.insulina}
                  onChange={(e) =>
                    setCalculoData((prev) => ({
                      ...prev,
                      insulina: e.target.value,
                    }))
                  }
                  type="number"
                  size="small"
                  placeholder="Ej: 10"
                  helperText="Valor normal: 2.6-24.9 μU/mL"
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: "success.50",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "success.light",
              }}
            >
              <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                Fórmula aplicada:
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: "monospace", mb: 1 }}>
                HOMA-IR = (Glicemia × Insulina) / 405
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Interpretación:
                <br />
                • ≤ 2.5: Normal (sin resistencia a la insulina)
                <br />
                • 2.5 - 3.8: Resistencia a la insulina leve
                <br />
                • &gt; 3.8: Resistencia a la insulina significativa
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalHomaOpen(false)}>Cancelar</Button>
            <Button
              onClick={calcularHoma}
              variant="contained"
              disabled={!calculoData.glicemia || !calculoData.insulina}
              sx={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                },
              }}
            >
              Calcular y Aplicar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de Cálculo Lípidos Totales */}
        <Dialog
          open={modalLipidosOpen}
          onClose={() => setModalLipidosOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <Calculate sx={{ mr: 1, color: "warning.main" }} />
              <Typography variant="h6" fontWeight={600}>
                Calcular Lípidos Totales
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ingrese los valores de Colesterol y Triglicéridos para calcular automáticamente los Lípidos Totales:
            </Typography>

            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Colesterol Total (mg/dL)"
                  value={calculoData.colesterol}
                  onChange={(e) =>
                    setCalculoData((prev) => ({
                      ...prev,
                      colesterol: e.target.value,
                    }))
                  }
                  type="number"
                  size="small"
                  placeholder="Ej: 180"
                  helperText="Valor deseable: < 200 mg/dL"
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Triglicéridos (mg/dL)"
                  value={calculoData.trigliceridos}
                  onChange={(e) =>
                    setCalculoData((prev) => ({
                      ...prev,
                      trigliceridos: e.target.value,
                    }))
                  }
                  type="number"
                  size="small"
                  placeholder="Ej: 120"
                  helperText="Valor deseable: < 150 mg/dL"
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: "warning.50",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "warning.light",
              }}
            >
              <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                Fórmula aplicada:
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: "monospace", mb: 1 }}>
                Lípidos Totales = Colesterol × 2.5 + Triglicéridos
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Interpretación:
                <br />
                • Valor deseable: &lt; 800 mg/dL
                <br />• Valores elevados pueden indicar riesgo cardiovascular
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalLipidosOpen(false)}>Cancelar</Button>
            <Button
              onClick={calcularLipidosTotales}
              variant="contained"
              disabled={!calculoData.colesterol || !calculoData.trigliceridos}
              sx={{
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                },
              }}
            >
              Calcular y Aplicar
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default RegistroExamen;