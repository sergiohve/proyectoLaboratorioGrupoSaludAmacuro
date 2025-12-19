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
};

const obtenerFechaVenezuela = () => {
  const ahora = new Date();
  const offset = -4 * 60;
  const fechaVenezuela = new Date(ahora.getTime() + offset * 60 * 1000);
  return fechaVenezuela.toISOString().split("T")[0];
};

const tiposExamen = Object.keys(plantillasExamenes);

// Interfaz para el modal de cálculo
interface CalculoModalData {
  trigliceridos: string;
  colesterol: string;
  hdl: string;
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
  const [calculoData, setCalculoData] = useState<CalculoModalData>({
    trigliceridos: "",
    colesterol: "",
    hdl: "",
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

  // Determinar si algún examen seleccionado requiere cálculos
  const esExamenConCalculos = () => {
    return formData.tiposExamen.some((tipo) =>
      tipo.includes("LIPIDICO") ||
      tipo.includes("QUIMICA SANGUINEA COMPLETA") ||
      tipo.includes("LIPIDOS TOTALES") ||
      tipo.includes("INDICE DE HOMA") ||
      plantillasExamenes[tipo]?.area === "QUIMICA SANGUINEA"
    );
  };

  // Obtener tipos de examen que requieren cálculos
  const obtenerTiposConCalculos = () => {
    return formData.tiposExamen.filter((tipo) =>
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
    });
    setModalOpen(true);
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
        const camposConTipo = plantilla.campos.map(campo => ({
          ...campo,
          tipoExamen: tipo
        }));
        nuevosCampos = [...nuevosCampos, ...camposConTipo];
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
    
    // Recalcular campos manteniendo solo los de los tipos restantes
    let nuevosCampos: CampoExamen[] = [];
    
    nuevosTipos.forEach((tipo: string) => {
      const plantilla = plantillasExamenes[tipo];
      if (plantilla) {
        const camposConTipo = plantilla.campos.map(campo => ({
          ...campo,
          tipoExamen: tipo
        }));
        nuevosCampos = [...nuevosCampos, ...camposConTipo];
      }
    });
    
    setFormData((prev) => ({
      ...prev,
      tiposExamen: nuevosTipos,
      area: nuevosTipos.length > 0 ? combinarAreas(nuevosTipos) : "",
      campos: nuevosCampos.length > 0 ? nuevosCampos : []
    }));
  };

  // Agregar un tipo de examen personalizado
  const agregarTipoPersonalizado = (tipo: string) => {
    if (!tipo || formData.tiposExamen.includes(tipo)) return;
    
    const nuevosTipos = [...formData.tiposExamen, tipo];
    setFormData((prev) => ({
      ...prev,
      tiposExamen: nuevosTipos,
      area: combinarAreas(nuevosTipos)
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
  const agregarCampoPersonalizado = () => {
    setFormData((prev) => ({
      ...prev,
      campos: [
        ...prev.campos,
        { 
          nombre: "", 
          resultado: "", 
          valorReferencia: "",
          tipoExamen: "Personalizado"
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
            {/* Selección de Cliente */}
            <Grid size={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Seleccionar Paciente</InputLabel>
                <Select
                  name="cliente"
                  value={formData.cliente}
                  label="Seleccionar Paciente"
                  onChange={handleChange}
                  required
                >
                  {clientes.map((cliente) => (
                    <MenuItem key={cliente._id} value={cliente._id}>
                      {cliente.nombre} - {cliente.cedula} ({cliente.edad} años,{" "}
                      {cliente.sexo})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Selección MÚLTIPLE de Tipo de Examen */}
            <Grid size={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipos de Examen</InputLabel>
                <Select
                  multiple
                  name="tiposExamen"
                  value={formData.tiposExamen}
                  onChange={handleTiposExamenChange}
                  label="Tipos de Examen"
                  required
                  renderValue={(selected) => (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {selected.map((value) => (
                        <Chip 
                          key={value} 
                          label={value} 
                          size="small"
                          color={getColorPorTipo(value)}
                          onDelete={(e) => {
                            e.stopPropagation();
                            eliminarTipoExamen(value);
                          }}
                          deleteIcon={<Close />}
                        />
                      ))}
                    </Stack>
                  )}
                >
                  {tiposExamen.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      <Checkbox checked={formData.tiposExamen.indexOf(tipo) > -1} />
                      <ListItemText primary={tipo} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Seleccione uno o más tipos de examen. Se combinarán automáticamente.
              </Typography>
            </Grid>

            {/* Autocomplete para tipo personalizado */}
            <Grid size={12}>
              <Autocomplete
                freeSolo
                options={tiposExamen.filter(tipo => !formData.tiposExamen.includes(tipo))}
                value=""
                onChange={(event: any, newValue: any) => {
                  if (newValue && !formData.tiposExamen.includes(newValue)) {
                    const nuevosTipos = [...formData.tiposExamen, newValue];
                    handleTiposExamenChange({ target: { value: nuevosTipos } });
                  }
                }}
                onInputChange={(event: any, newInputValue: any) => {
                  if (newInputValue && event.type === 'keydown' && event.key === 'Enter') {
                    agregarTipoPersonalizado(newInputValue);
                  }
                }}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    label="Agregar tipo personalizado"
                    size="small"
                    placeholder="Escriba y presione Enter para agregar"
                  />
                )}
              />
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
            {esExamenConCalculos() && (
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
                <Typography variant="caption" color="text.secondary">
                  Cálculos disponibles para: {obtenerTiposConCalculos().join(", ")}
                </Typography>
              </Grid>
            )}

            {/* Modern Exam Parameters Section */}
            <Grid size={12}>
              <Box sx={{ mb: 2 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background:
                      "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)",
                    border: "1px solid",
                    borderColor: "success.light",
                  }}
                >
                  <Box>
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
                      Parámetros del Examen
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formData.campos.length} parámetro(s) combinado(s) de {formData.tiposExamen.length} examen(s)
                    </Typography>
                  </Box>
                  <Button
                    startIcon={<Add />}
                    onClick={agregarCampoPersonalizado}
                    variant="contained"
                    size="small"
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      background:
                        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #059669 0%, #047857 100%)",
                        transform: "scale(1.05)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    Agregar Campo
                  </Button>
                </Box>

                {formData.campos.length > 0 ? (
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
                    <Table size="small" stickyHeader>
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
                              width: "15%",
                              fontSize: "0.95rem",
                            }}
                          >
                            VALOR REF.
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "success.dark",
                              fontWeight: 700,
                              width: "5%",
                              fontSize: "0.95rem",
                            }}
                          >
                            Acción
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formData.campos.map((campo, index) => (
                          <TableRow key={index} hover>
                           
                            <TableCell>
                              <TextField
                                fullWidth
                                size="small"
                                value={campo.nombre}
                                onChange={(e) =>
                                  handleCampoChange(
                                    index,
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
                                    index,
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
                                    index,
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
                                onClick={() => eliminarCampo(index)}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
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
              </Box>
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
      </CardContent>
    </Card>
  );
};

export default RegistroExamen;