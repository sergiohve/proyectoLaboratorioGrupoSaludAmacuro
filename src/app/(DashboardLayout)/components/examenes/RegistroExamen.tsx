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
  Divider,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
} from "@mui/material";
import { Save, MedicalServices, Add, Delete } from "@mui/icons-material";

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
}

interface ExamenForm {
  cliente: string;
  tipoExamen: string;
  area: string;
  observaciones: string;
  fechaExamen: string;
  campos: CampoExamen[];
}

// Plantillas de exámenes basadas en las imágenes
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
      { nombre: "CRISTALES", resultado: "", valorReferencia: "ESCASOS" },
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
      { nombre: "HIV (TEST Pack)", resultado: "", valorReferencia: "NEGATIVO" },
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
};
const obtenerFechaVenezuela = () => {
  const ahora = new Date();
 
  const offset = -4 * 60;
  const fechaVenezuela = new Date(ahora.getTime() + offset * 60 * 1000);
  return fechaVenezuela.toISOString().split("T")[0];
};
const tiposExamen = Object.keys(plantillasExamenes);

const RegistroExamen = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [formData, setFormData] = useState<ExamenForm>({
    cliente: "",
    tipoExamen: "",
    area: "",
    observaciones: "",
    fechaExamen: obtenerFechaVenezuela(),
    campos: [{ nombre: "", resultado: "", valorReferencia: "" }], // Siempre al menos un campo
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Cargar clientes al montar el componente
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await fetch("https://backinvent.onrender.com/api/clientes");
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

  const handleChange = (
    e: any
  ): any => {
    const { name, value } = e.target;
    if (name) {
      if (name === "tipoExamen") {
        const plantilla = plantillasExamenes[value as string];
        setFormData((prev) => ({
          ...prev,
          tipoExamen: value as string,
          area: plantilla?.area || "",
          campos: plantilla ? [...plantilla.campos] : prev.campos.length > 0 ? prev.campos : [{ nombre: "", resultado: "", valorReferencia: "" }],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
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

  const agregarCampo = () => {
    setFormData((prev) => ({
      ...prev,
      campos: [
        ...prev.campos,
        { nombre: "", resultado: "", valorReferencia: "" },
      ],
    }));
  };

  const eliminarCampo = (index: number) => {
    // No permitir eliminar si solo queda un campo
    if (formData.campos.length <= 1) return;
    
    setFormData((prev) => ({
      ...prev,
      campos: prev.campos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!formData.cliente || !formData.tipoExamen) {
      setMessage({
        type: "error",
        text: "Cliente y tipo de examen son requeridos",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("https://backinvent.onrender.com/api/examenes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cliente: formData.cliente,
          tipoExamen: formData.tipoExamen,
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
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Examen registrado exitosamente" });
        setFormData({
          cliente: "",
          tipoExamen: "",
          area: "",
          observaciones: "",
          fechaExamen: new Date().toISOString().split("T")[0],
          campos: [{ nombre: "", resultado: "", valorReferencia: "" }], // Resetear con un campo
        });
        window.dispatchEvent(new Event("examenAdded"));
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

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <MedicalServices sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h5" fontWeight={600}>
            Registrar Examen Médico
          </Typography>
        </Box>

        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
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

            {/* Tipo de Examen */}
            <Grid size={12}>
              <Autocomplete
                freeSolo
                options={tiposExamen}
                value={formData.tipoExamen}
                onChange={(event: any, newValue: any) => {
                  if (newValue) {
                    const plantilla = plantillasExamenes[newValue];
                    setFormData((prev) => ({
                      ...prev,
                      tipoExamen: newValue,
                      area: plantilla?.area || "",
                      campos: plantilla ? [...plantilla.campos] : prev.campos.length > 0 ? prev.campos : [{ nombre: "", resultado: "", valorReferencia: "" }],
                    }));
                  }
                }}
                onInputChange={(event: any, newInputValue: any) => {
                  // Si el usuario está escribiendo y no selecciona una opción
                  if (newInputValue && !tiposExamen.includes(newInputValue)) {
                    setFormData((prev) => ({
                      ...prev,
                      tipoExamen: newInputValue,
                      area: "",
                      // Mantener los campos existentes o al menos uno
                      campos: prev.campos.length > 0 ? prev.campos : [{ nombre: "", resultado: "", valorReferencia: "" }],
                    }));
                  }
                }}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    label="Tipo de Examen"
                    required
                    size="small"
                    placeholder="Seleccionar de la lista o escribir un tipo personalizado"
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

            {/* Área del Examen (automática) */}
            {formData.area && (
              <Grid size={12}>
                <Paper
                  elevation={1}
                  sx={{ p: 2, bgcolor: "primary.light", color: "white" }}
                >
                  <Typography variant="h6" align="center" fontWeight={600}>
                    ÁREA DE: {formData.area}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {/* Campos del Examen - SIEMPRE VISIBLE */}
            <Grid size={12}>
              <Box sx={{ mb: 2 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography variant="h6" color="primary">
                    Parámetros del Examen
                  </Typography>
                  <Button
                    startIcon={<Add />}
                    onClick={agregarCampo}
                    variant="outlined"
                    size="small"
                  >
                    Agregar Campo
                  </Button>
                </Box>

                <TableContainer component={Paper} elevation={2}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "primary.main" }}>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            width: "35%",
                            minWidth: "200px",
                          }}
                        >
                          PRUEBA
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            width: "30%",
                            minWidth: "150px",
                          }}
                        >
                          RESULTADO
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            width: "30%",
                            minWidth: "200px",
                          }}
                        >
                          VALOR DE REFERENCIA
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            width: "5%",
                            minWidth: "80px",
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
                                '& .MuiInputBase-input': {
                                  fontSize: '14px',
                                  padding: '8px 12px',
                                }
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
                                '& .MuiInputBase-input': {
                                  fontSize: '14px',
                                  padding: '8px 12px',
                                }
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
                                '& .MuiInputBase-input': {
                                  fontSize: '14px',
                                  padding: '8px 12px',
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => eliminarCampo(index)}
                              disabled={formData.campos.length <= 1} // Deshabilitar si solo hay un campo
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
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
                  '& .MuiInputBase-input': {
                    fontSize: '14px',
                  }
                }}
              />
            </Grid>

            {/* Botón de guardar */}
            <Grid size={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                startIcon={<Save />}
                sx={{ mt: 1, py: 1.5, fontSize: "1.1rem" }}
                size="large"
              >
                {loading ? "Registrando Examen..." : "Guardar Examen Médico"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegistroExamen;