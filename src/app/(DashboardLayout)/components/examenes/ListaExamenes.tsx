"use client";
import { useState, useEffect, useRef } from "react";
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  InputAdornment,
  TablePagination,
  Tooltip,
} from "@mui/material";
import {
  Edit,
  Delete,
  MedicalServices,
  Visibility,
  Save,
  Close,
  PictureAsPdf,
  Search,
  Warning,
  CheckCircle,
  LocationOn,
} from "@mui/icons-material";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Cliente {
  _id: string;
  nombre: string;
  cedula: string;
  edad: number;
  sexo: string;
  direccion: string;
}

interface Examen {
  _id: string;
  cliente: Cliente;
  tipoExamen: string;
  area: string;
  resultados: { [key: string]: { resultado: string; valorReferencia: string } };
  observaciones: string;
  fechaExamen: string;
  estado: string;
  createdAt: string;
}

const ListaExamenes = () => {
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [examenesFiltrados, setExamenesFiltrados] = useState<Examen[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVerAbierto, setModalVerAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [modalConfirmacionAbierto, setModalConfirmacionAbierto] =
    useState(false);
  const [modalExitoAbierto, setModalExitoAbierto] = useState(false);
  const [examenSeleccionado, setExamenSeleccionado] = useState<any>(null);
  const [examenAEliminar, setExamenAEliminar] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(5);
  const [actualizandoEstados, setActualizandoEstados] = useState<{
    [key: string]: boolean;
  }>({});
  const [mensajeExito, setMensajeExito] = useState("");

  const pdfRef = useRef<HTMLDivElement>(null);

  // Función para obtener los tipos de examen separados
  const obtenerTiposExamen = (tipoExamen: string): string[] => {
    return tipoExamen.split(" + ").map((tipo) => tipo.trim());
  };

  // Función para agrupar resultados por tipo de examen (si hay múltiples tipos)
  const agruparResultadosPorTipo = (
    tipoExamen: string,
    resultados: { [key: string]: { resultado: string; valorReferencia: string } }
  ) => {
    const tipos = obtenerTiposExamen(tipoExamen);

    // Si solo hay un tipo, devolver todos los resultados bajo ese tipo
    if (tipos.length === 1) {
      return [{ tipo: tipos[0], resultados: resultados }];
    }

    // Si hay múltiples tipos, intentar agruparlos (por ahora, dividir equitativamente)
    // En una implementación más robusta, usarías las plantillas para determinar la pertenencia
    const resultadosArray = Object.entries(resultados);
    const grupos: { tipo: string; resultados: any }[] = [];

    // Por ahora, simplemente dividir los resultados equitativamente entre los tipos
    const resultadosPorTipo = Math.ceil(resultadosArray.length / tipos.length);

    tipos.forEach((tipo, index) => {
      const inicio = index * resultadosPorTipo;
      const fin = Math.min((index + 1) * resultadosPorTipo, resultadosArray.length);
      const resultadosTipo = Object.fromEntries(resultadosArray.slice(inicio, fin));

      if (Object.keys(resultadosTipo).length > 0) {
        grupos.push({ tipo, resultados: resultadosTipo });
      }
    });

    return grupos;
  };

  const fetchExamenes = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://backinvent.onrender.com/api/examenes"
      );
      if (!response.ok) throw new Error("Error al cargar exámenes");
      const data = await response.json();
      setExamenes(data);
      setExamenesFiltrados(data);
    } catch (err) {
      setError("Error al cargar los exámenes");
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchExamenes();
    fetchClientes();

    const handleExamenAdded = () => fetchExamenes();
    window.addEventListener("examenAdded", handleExamenAdded);

    return () => {
      window.removeEventListener("examenAdded", handleExamenAdded);
    };
  }, []);

  // Función de búsqueda
  useEffect(() => {
    if (terminoBusqueda.trim() === "") {
      setExamenesFiltrados(examenes);
    } else {
      const termino = terminoBusqueda.toLowerCase();
      const filtrados = examenes.filter(
        (examen) =>
          examen.cliente.nombre.toLowerCase().includes(termino) ||
          examen.cliente.cedula.toLowerCase().includes(termino) ||
          examen.cliente.direccion.toLowerCase().includes(termino) ||
          examen.tipoExamen.toLowerCase().includes(termino) ||
          examen.area.toLowerCase().includes(termino)
      );
      setExamenesFiltrados(filtrados);
    }
    setPagina(0);
  }, [terminoBusqueda, examenes]);

  const handleChangePagina = (_event: unknown, nuevaPagina: number) => {
    setPagina(nuevaPagina);
  };

  const handleChangeFilasPorPagina = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilasPorPagina(parseInt(event.target.value, 10));
    setPagina(0);
  };

  const handleBusquedaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTerminoBusqueda(event.target.value);
  };

  const handleDeleteClick = (id: string) => {
    setExamenAEliminar(id);
    setModalConfirmacionAbierto(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!examenAEliminar) return;

    try {
      const response = await fetch(
        `https://backinvent.onrender.com/api/examenes/${examenAEliminar}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setExamenes(
          examenes.filter((examen) => examen._id !== examenAEliminar)
        );
        setMensajeExito("Examen eliminado exitosamente");
        setModalExitoAbierto(true);
      } else {
        setError("Error al eliminar el examen");
      }
    } catch (error) {
      setError("Error de conexión");
    } finally {
      setModalConfirmacionAbierto(false);
      setExamenAEliminar(null);
    }
  };

  const handleVerExamen = (examen: Examen) => {
    setExamenSeleccionado(examen);
    setModalVerAbierto(true);
  };

  const handleEditarExamen = (examen: Examen) => {
    setExamenSeleccionado(examen);
    setModalEditarAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalVerAbierto(false);
    setModalEditarAbierto(false);
    setExamenSeleccionado(null);
    setEditando(false);
  };

  const handleCerrarModalConfirmacion = () => {
    setModalConfirmacionAbierto(false);
    setExamenAEliminar(null);
  };

  const handleCerrarModalExito = () => {
    setModalExitoAbierto(false);
    setMensajeExito("");
  };

  // Función para actualizar el estado directamente desde la tabla
  const handleEstadoChange = async (examenId: string, nuevoEstado: string) => {
    setActualizandoEstados((prev) => ({ ...prev, [examenId]: true }));

    try {
      const response = await fetch(
        `https://backinvent.onrender.com/api/examenes/${examenId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            estado: nuevoEstado,
          }),
        }
      );

      if (response.ok) {
        setExamenes((prevExamenes) =>
          prevExamenes.map((examen) =>
            examen._id === examenId
              ? { ...examen, estado: nuevoEstado }
              : examen
          )
        );
        setExamenesFiltrados((prevExamenes) =>
          prevExamenes.map((examen) =>
            examen._id === examenId
              ? { ...examen, estado: nuevoEstado }
              : examen
          )
        );
      } else {
        setError("Error al actualizar el estado del examen");
      }
    } catch (error) {
      setError("Error de conexión");
    } finally {
      setActualizandoEstados((prev) => ({ ...prev, [examenId]: false }));
    }
  };

  const handleGuardarEdicion = async () => {
    if (!examenSeleccionado) return;

    setEditando(true);
    try {
      const response = await fetch(
        `https://backinvent.onrender.com/api/examenes/${examenSeleccionado._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resultados: examenSeleccionado.resultados,
            observaciones: examenSeleccionado.observaciones,
            estado: examenSeleccionado.estado,
          }),
        }
      );

      if (response.ok) {
        await fetchExamenes();
        handleCerrarModal();
        setMensajeExito("Examen actualizado exitosamente");
        setModalExitoAbierto(true);
      } else {
        setError("Error al actualizar el examen");
      }
    } catch (error) {
      setError("Error de conexión");
    } finally {
      setEditando(false);
    }
  };

  const handleResultadoChange = (campo: string, valor: string) => {
    if (examenSeleccionado) {
      setExamenSeleccionado({
        ...examenSeleccionado,
        resultados: {
          ...examenSeleccionado.resultados,
          [campo]: {
            ...examenSeleccionado.resultados[campo],
            resultado: valor,
          },
        },
      });
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Entregado":
        return "success";
      case "Pendiente de entrega":
        return "warning";
      case "Vencido":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    // Forzar la interpretación como UTC
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

    const day = utcDate.getUTCDate().toString().padStart(2, "0");
    const month = (utcDate.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = utcDate.getUTCFullYear();

    return `${day}/${month}/${year}`;
  };

  const formatDateForPDF = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Función para determinar las unidades basadas en los valores de referencia
  const determinarUnidad = (valorReferencia: string) => {
    const valor = valorReferencia.toLowerCase().trim();

    // Si el valor de referencia es un color o una descripción cualitativa
    if (
      valor.includes("amarillo") ||
      valor.includes("sugeneris") ||
      valor.includes("limpida") ||
      valor.includes("ácida") ||
      valor.includes("alcalina") ||
      valor.includes("negativo") ||
      valor.includes("positivo") ||
      valor.includes("trazas") ||
      valor.includes("escasas") ||
      valor.includes("ausentes") ||
      valor.includes("x campos") ||
      valor.includes("x campo") ||
      valor === "-" ||
      valor === ""
    ) {
      return "-";
    }

    // Extraer unidades específicas del valor de referencia
    // Buscar patrones de unidades comunes
    const unidadesPatrones = [
      { patron: /mg\/dl/i, unidad: "mg/dL" },
      { patron: /mg\/l/i, unidad: "mg/L" },
      { patron: /mmol\/l/i, unidad: "mmol/L" },
      { patron: /g\/dl/i, unidad: "g/dL" },
      { patron: /g\/l/i, unidad: "g/L" },
      { patron: /iu\/l/i, unidad: "IU/L" },
      { patron: /ui\/l/i, unidad: "UI/L" },
      { patron: /u\/l/i, unidad: "U/L" },
      { patron: /u\/ml/i, unidad: "U/mL" },
      { patron: /μl|ul/i, unidad: "μL" },
      { patron: /cel\/μl/i, unidad: "cel/μL" },
      { patron: /cel\/ul/i, unidad: "cel/μL" },
      { patron: /cel\/mm3/i, unidad: "cel/mm³" },
      { patron: /x 10\^3\/μl/i, unidad: "x 10³/μL" },
      { patron: /x 10\^6\/μl/i, unidad: "x 10⁶/μL" },
      { patron: /fl/i, unidad: "fL" },
      { patron: /pg/i, unidad: "pg" },
      { patron: /%/i, unidad: "%" },
      { patron: /mm\/h/i, unidad: "mm/h" },
      { patron: /seg|sec/i, unidad: "seg" },
      { patron: /min/i, unidad: "min" },
    ];

    // Buscar coincidencias con los patrones
    for (const { patron, unidad } of unidadesPatrones) {
      if (patron.test(valorReferencia)) {
        return unidad;
      }
    }

    // Si no se encuentra ninguna unidad específica, devolver "-"
    return "-";
  };

  const descargarPDF = async () => {
    if (!pdfRef.current || !examenSeleccionado) return;

    setGenerandoPDF(true);
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      const fileName = `Examen_${examenSeleccionado.cliente?.nombre?.replace(
        /\s+/g,
        "_"
      )}_${examenSeleccionado?.tipoExamen?.replace(
        /\s+/g,
        "_"
      )}_${formatDateForPDF(examenSeleccionado.fechaExamen)}.pdf`;

      pdf.save(fileName);
    } catch (error) {
      console.error("Error generando PDF:", error);
      setError("Error al generar el PDF");
    } finally {
      setGenerandoPDF(false);
    }
  };

  const imprimirPDFDirecto = async () => {
    if (!pdfRef.current || !examenSeleccionado) return;

    setGenerandoPDF(true);
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      // Crear un Blob del PDF
      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Abrir en nueva ventana para imprimir
      const printWindow = window.open(pdfUrl, "_blank");

      if (printWindow) {
        printWindow.addEventListener("load", () => {
          printWindow.print();
          // Liberar el objeto URL después de un tiempo
          setTimeout(() => {
            URL.revokeObjectURL(pdfUrl);
          }, 1000);
        });
      } else {
        // Si el popup fue bloqueado, mostrar mensaje de error
        setError("Por favor, permite ventanas emergentes para imprimir el PDF");
        URL.revokeObjectURL(pdfUrl);
      }
    } catch (error) {
      console.error("Error generando PDF para imprimir:", error);
      setError("Error al generar el PDF para imprimir");
    } finally {
      setGenerandoPDF(false);
    }
  };

  // Calcular exámenes para la página actual
  const examenesPaginados = examenesFiltrados.slice(
    pagina * filasPorPagina,
    pagina * filasPorPagina + filasPorPagina
  );

  if (loading) {
    return (
      <DashboardCard title="Exámenes Registrados">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={200}
        >
          <CircularProgress />
        </Box>
      </DashboardCard>
    );
  }
  console.log(examenSeleccionado);
  return (
    <>
      <DashboardCard
        title="Exámenes Registrados"
        action={
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="textSecondary">
              Total: {examenesFiltrados.length}
            </Typography>
            {examenesFiltrados.length !== examenes.length && (
              <Chip
                label={`Filtrados: ${examenesFiltrados.length}`}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        }
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Modern Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Buscar por cédula, nombre, dirección, tipo de examen o área..."
            value={terminoBusqueda}
            onChange={handleBusquedaChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "success.main" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                backgroundColor: "background.paper",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                },
                "&.Mui-focused": {
                  boxShadow: "0 4px 20px rgba(16, 185, 129, 0.15)",
                  "& fieldset": {
                    borderWidth: 2,
                    borderColor: "#000",
                  },
                },
                "& fieldset": {
                  borderWidth: 2,
                  borderColor: "divider",
                },
              },
              "& .MuiInputBase-input": {
                py: 1.5,
                fontSize: "0.95rem",
              },
            }}
          />
          {terminoBusqueda && (
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ mt: 1, display: "block" }}
            >
              {examenesFiltrados.length === 0
                ? "No se encontraron exámenes"
                : `Mostrando ${examenesFiltrados.length} de ${examenes.length} exámenes`}
            </Typography>
          )}
        </Box>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "2px solid",
            borderColor: "divider",
          }}
        >
          <Table
            aria-label="tabla de exámenes"
            sx={{
              whiteSpace: "nowrap",
              "& .MuiTableCell-root": { borderBottom: "none" },
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.08) 100%)",
                  "& .MuiTableCell-root": {
                    borderBottom: "2px solid",
                    borderColor: "#000",
                    py: 2,
                  },
                }}
              >
                <TableCell sx={{ minWidth: "200px" }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="success.dark"
                  >
                    Paciente
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: "150px" }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="success.dark"
                  >
                    Dirección
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: "150px" }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="success.dark"
                  >
                    Examen
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: "100px" }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="success.dark"
                  >
                    Fecha
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: "180px" }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="success.dark"
                  >
                    Estado
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ minWidth: "120px" }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="success.dark"
                  >
                    Acciones
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {examenesPaginados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      {terminoBusqueda
                        ? "No se encontraron exámenes que coincidan con la búsqueda"
                        : "No hay exámenes registrados"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                examenesPaginados.map((examen) => (
                  <TableRow
                    key={examen._id}
                    sx={{
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "action.hover",
                        transform: "scale(1.001)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      },
                      "&:last-child td": {
                        borderBottom: 0,
                      },
                    }}
                  >
                    <TableCell sx={{ borderBottom: "none" }}>
                      <Box display="flex" alignItems="center">
                        <MedicalServices
                          sx={{ mr: 1, color: "primary.main" }}
                        />
                        <Box>
                          <Typography
                            sx={{ color: "#000" }}
                            variant="subtitle2"
                            fontWeight={600}
                          >
                            {examen?.cliente?.nombre ?? "Dato eliminado"}
                          </Typography>
                          <Typography color="textSecondary" fontSize="13px">
                            CI: {examen.cliente?.cedula ?? "Dato eliminado"} |{" "}
                            {examen.cliente?.edad ?? ""} años
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      <Tooltip
                        title={examen.cliente?.direccion ?? "Dato eliminado"}
                        arrow
                        placement="top"
                      >
                        <Box display="flex" alignItems="flex-start">
                          <LocationOn
                            sx={{
                              mr: 0.5,
                              color: "text.secondary",
                              fontSize: "16px",
                              mt: 0.25,
                            }}
                          />
                          <Typography
                            variant="subtitle2"
                            fontWeight={400}
                            sx={{
                              maxWidth: "150px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              lineHeight: 1.2,
                            }}
                          >
                            {examen.cliente?.direccion ?? "Cliente eliminado"}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      <Typography variant="subtitle2" fontWeight={400}>
                        {examen.tipoExamen}
                      </Typography>
                      <Typography color="textSecondary" fontSize="12px">
                        {examen.area}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      <Typography variant="subtitle2" fontWeight={400}>
                        {formatDate(examen.fechaExamen)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      <FormControl size="small" sx={{ minWidth: 180 }}>
                        <Select
                          value={examen.estado}
                          onChange={(e) =>
                            handleEstadoChange(examen._id, e.target.value)
                          }
                          disabled={actualizandoEstados[examen._id]}
                          sx={{
                            height: "32px",
                            fontSize: "0.875rem",
                            "& .MuiSelect-select": {
                              py: 0.5,
                            },
                          }}
                        >
                          <MenuItem value="Pendiente de entrega">
                            Pendiente de entrega
                          </MenuItem>
                          <MenuItem value="Entregado">Entregado</MenuItem>
                          <MenuItem value="Vencido">Vencido</MenuItem>
                        </Select>
                      </FormControl>
                      {actualizandoEstados[examen._id] && (
                        <CircularProgress size={16} sx={{ ml: 1 }} />
                      )}
                    </TableCell>
                    <TableCell align="center" sx={{ borderBottom: "none" }}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          justifyContent: "center",
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleVerExamen(examen)}
                          sx={{
                            bgcolor: "info.main",
                            color: "white",
                            "&:hover": {
                              bgcolor: "info.dark",
                              transform: "scale(1.1)",
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEditarExamen(examen)}
                          sx={{
                            bgcolor: "success.main",
                            color: "white",
                            "&:hover": {
                              bgcolor: "success.dark",
                              transform: "scale(1.1)",
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(examen._id)}
                          sx={{
                            bgcolor: "error.main",
                            color: "white",
                            "&:hover": {
                              bgcolor: "error.dark",
                              transform: "scale(1.1)",
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Paginación */}
          {examenesFiltrados.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={examenesFiltrados.length}
              rowsPerPage={filasPorPagina}
              page={pagina}
              onPageChange={handleChangePagina}
              onRowsPerPageChange={handleChangeFilasPorPagina}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
              }
              sx={{
                "& .MuiTablePagination-toolbar": {
                  padding: 1,
                },
                "& .MuiTablePagination-root": {
                  borderTop: "none",
                },
              }}
            />
          )}
        </TableContainer>
      </DashboardCard>

      {/* Modal para Ver Examen */}
      <Dialog
        open={modalVerAbierto}
        onClose={handleCerrarModal}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center">
              <MedicalServices sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h5" fontWeight={600}>
                Detalles del Examen
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Button
                variant="contained"
                onClick={imprimirPDFDirecto}
                disabled={generandoPDF}
                startIcon={
                  generandoPDF ? (
                    <CircularProgress size={16} />
                  ) : (
                    <PictureAsPdf />
                  )
                }
                sx={{
                  background: "white",
                  border: "1px solid #6082e9ff",
                  color: "black",
                  "&:hover": {
                    background: "#f3f4f6",
                  },
                }}
              >
                {generandoPDF ? "Preparando..." : "Imprimir PDF Directo"}
              </Button>
              <Button
                variant="outlined"
                startIcon={
                  generandoPDF ? (
                    <CircularProgress size={16} />
                  ) : (
                    <PictureAsPdf />
                  )
                }
                onClick={descargarPDF}
                disabled={generandoPDF}
                size="small"
              >
                {generandoPDF ? "Generando..." : "Descargar PDF"}
              </Button>
              <IconButton onClick={handleCerrarModal} size="small">
                <Close />
              </IconButton>
            </Box>
          </Box>
          {examenSeleccionado && (
            <Typography variant="body2" color="textSecondary">
              ID: {examenSeleccionado._id}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent dividers>
          {examenSeleccionado && (
            <Box
              ref={pdfRef}
              sx={{
                p: 3,
                backgroundColor: "white",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {/* Modern PDF Header */}
              <Box
                sx={{
                  pb: 2,
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      fontWeight="700"
                      sx={{
                        fontSize: "14px",
                        lineHeight: 1.4,
                        color: "#374151",
                        mb: 0.5,
                      }}
                    >
                      RIF J-30857988-2
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="800"
                      sx={{
                        fontSize: "22px",
                        lineHeight: 1.2,
                        WebkitBackgroundClip: "text",

                        mb: 0.5,
                        color: "black",
                      }}
                    >
                      LABORATORIO CLÍNICO
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="600"
                      sx={{
                        fontSize: "14px",
                        lineHeight: 1.4,
                        color: "#6b7280",
                      }}
                    >
                      Lcda Vivían Fagre Naim
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "center", flex: 1 }}>
                    <img
                      src="/images/logos/back.png"
                      alt="logo"
                      height={120}
                      width={300}
                      crossOrigin="anonymous"
                      style={{ margin: "0 auto", display: "block" }}
                    />
                  </Box>
                  <Box sx={{ flex: 1, textAlign: "right" }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "11px",
                        lineHeight: 1.4,
                        color: "#9ca3af",
                        fontWeight: 500,
                      }}
                    >
                      Página 1 de 1
                    </Typography>
                  </Box>
                </Box>

                {/* Información de Contacto - Arriba */}
                <Box
                  sx={{
                    textAlign: "center",
                    pt: 1,
                    mb: -2,
                    borderTop: "1px solid #e5e7eb",
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight="600"
                    sx={{ fontSize: "11px", color: "#000" }}
                  >
                    Calle Tucupita, Local 16, Nro 2, Centro, Tucupita, Edo. Delta
                    Amacuro. | Teléfonos: +58 424-9016271
                  </Typography>
                </Box>
              </Box>

              {/* Modern Patient Information */}
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  borderRadius: 2,

                  border: "1px solid #000",
                }}
              >
                <Table
                  size="small"
                  sx={{
                    whiteSpace: "nowrap",
                    "& .MuiTableCell-root": { borderBottom: "none", py: 0.5 },
                  }}
                >
                  <TableBody>
                    <TableRow sx={{ borderBottom: "none" }}>
                      <TableCell
                        sx={{
                          border: "none",
                          p: 0,
                          width: "15%",
                          fontWeight: "700",
                          fontSize: "11px",
                          color: "#000",
                        }}
                      >
                        PACIENTE:
                      </TableCell>
                      <TableCell
                        sx={{
                          border: "none",
                          p: 0,
                          width: "35%",
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "#1f2937",
                        }}
                      >
                        {examenSeleccionado.cliente?.nombre?.toUpperCase() ??
                          "Dato eliminado"}
                      </TableCell>
                      <TableCell
                        sx={{
                          border: "none",
                          p: 0,
                          width: "10%",
                          fontWeight: "700",
                          fontSize: "11px",
                          color: "#000",
                        }}
                      >
                        C.I.:
                      </TableCell>
                      <TableCell
                        sx={{
                          border: "none",
                          p: 0,
                          width: "40%",
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "#1f2937",
                        }}
                      >
                        {examenSeleccionado.cliente?.cedula ?? "Dato eliminado"}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ borderBottom: "none" }}>
                      <TableCell
                        sx={{
                          border: "none",
                          p: 0,
                          fontWeight: "700",
                          fontSize: "11px",
                          color: "#000",
                        }}
                      >
                        EDAD:
                      </TableCell>
                      <TableCell
                        sx={{
                          border: "none",
                          p: 0,
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "#1f2937",
                        }}
                      >
                        {examenSeleccionado.cliente?.edad ?? "Dato eliminado"}{" "}
                        años
                      </TableCell>
                      <TableCell
                        sx={{
                          border: "none",
                          p: 0,
                          fontWeight: "700",
                          fontSize: "11px",
                          color: "#000",
                        }}
                      >
                        CONVENIO:
                      </TableCell>
                      <TableCell
                        sx={{
                          border: "none",
                          p: 0,
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "#1f2937",
                        }}
                      >
                        PARTICULAR
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ borderBottom: "none" }}>
                      <TableCell
                        sx={{
                          border: "none",
                          p: 0,
                          fontWeight: "700",
                          fontSize: "11px",
                          color: "#000",
                        }}
                      >
                        GÉNERO:
                      </TableCell>
                      <TableCell
                        sx={{
                          border: "none",
                          p: 0,
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "#1f2937",
                        }}
                      >
                        {examenSeleccionado.cliente?.sexo === "Masculino"
                          ? "MASCULINO"
                          : examenSeleccionado.cliente?.sexo === "Femenino"
                          ? "FEMENINO"
                          : examenSeleccionado.cliente?.sexo.toUpperCase()}
                      </TableCell>
                      <TableCell
                        sx={{
                          border: "none",
                          p: 0,
                          fontWeight: "700",
                          fontSize: "11px",
                          color: "#000",
                        }}
                      >
                        DIRECCIÓN:
                      </TableCell>
                      <TableCell
                        sx={{
                          border: "none",
                          p: 0,
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "#1f2937",
                        }}
                      >
                        {examenSeleccionado.cliente?.direccion ??
                          "Dato eliminado"}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ borderBottom: "none" }}>
                      <TableCell
                        sx={{
                          border: "none",
                          p: 0,
                          fontWeight: "700",
                          fontSize: "11px",
                          color: "#000",
                        }}
                      >
                        FECHA MUESTRA:
                      </TableCell>
                      <TableCell
                        sx={{
                          border: "none",
                          p: 0,
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "#1f2937",
                        }}
                      >
                        {formatDate(examenSeleccionado.fechaExamen)}
                      </TableCell>
                      <TableCell
                        sx={{
                          border: "none",
                          p: 0,
                          fontWeight: "700",
                          fontSize: "11px",
                          color: "#000",
                        }}
                      >
                        FECHA REPORTE:
                      </TableCell>
                      <TableCell
                        sx={{
                          border: "none",
                          p: 0,
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "#1f2937",
                        }}
                      >
                        {formatDate(new Date().toISOString())}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ borderBottom: "none" }}>
                      <TableCell
                        sx={{
                          border: "none",
                          p: 0,
                          fontWeight: "700",
                          fontSize: "11px",
                          color: "#000",
                        }}
                      >
                        N° ORDEN:
                      </TableCell>
                      <TableCell
                        sx={{
                          border: "none",
                          p: 0,
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "#1f2937",
                        }}
                      >
                        {examenesFiltrados.length + 1}
                      </TableCell>
                      <TableCell sx={{ border: "none", p: 0 }}></TableCell>
                      <TableCell sx={{ border: "none", p: 0 }}></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>

              {/* Modern Results Title */}
              <Box
                sx={{
                  textAlign: "center",
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  borderColor: "black",
                  border: 1,
                }}
              >
                <Typography
                  variant="h5"
                  fontWeight="800"
                  sx={{
                    fontSize: "18px",
                    color: "black",
                    letterSpacing: 1,
                  }}
                >
                  RESULTADOS DE LABORATORIO
                </Typography>
              </Box>

              {/* Modern Results Tables - Agrupados por tipo de examen */}
              {agruparResultadosPorTipo(
                examenSeleccionado.tipoExamen,
                examenSeleccionado.resultados
              ).map((grupo, grupoIndex) => (
                <Box key={grupoIndex} sx={{ mb: 3 }}>
                  {/* Título del tipo de examen (solo si hay múltiples tipos) */}
                  {obtenerTiposExamen(examenSeleccionado.tipoExamen).length > 1 && (
                    <Typography
                      variant="h5"
                      fontWeight="900"
                      sx={{
                        fontSize: "14px",
                        color: "#111413ff",
                        fontWeight: "bold",
                        mb: 1.5,
                        textAlign: "left",
                        textTransform: "uppercase",
                        pl: 1,
                      }}
                    >
                      {grupo.tipo}
                    </Typography>
                  )}

                  {/* Tabla de resultados para este tipo */}
                  <Box
                    sx={{
                      border: "2px solid #e5e7eb",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <Table
                      size="small"
                      sx={{
                        "& .MuiTableCell-root": {
                          border: "none",
                          borderBottom: "none",
                        },
                      }}
                    >
                      <TableHead>
                        <TableRow
                          sx={{
                            background: "transparent",
                            borderBottom: "none",
                          }}
                        >
                          <TableCell
                            sx={{
                              fontWeight: "800",
                              textAlign: "left",
                              width: "10%",
                              border: "none",
                              fontSize: "12px",
                              color: "#000",
                              py: 1.5,
                              px: 2,
                            }}
                          >
                            DESCRIPCIÓN DE EXAMEN
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "800",
                              textAlign: "center",
                              width: "10%",
                              border: "none",
                              fontSize: "12px",
                              color: "#000",
                              py: 1.5,
                            }}
                          >
                            RESULTADO
                          </TableCell>
                          {examenSeleccionado.area !== "ORINA" && (
                            <TableCell
                              sx={{
                                fontWeight: "800",
                                textAlign: "center",
                                width: "10%",
                                border: "none",
                                fontSize: "12px",
                                color: "#000",
                                py: 1.5,
                              }}
                            >
                              UNIDADES
                            </TableCell>
                          )}
                          <TableCell
                            sx={{
                              fontWeight: "800",
                              textAlign: "center",
                              width: "10%",
                              border: "none",
                              fontSize: "12px",
                              color: "#000",
                              py: 1.5,
                            }}
                          >
                            VALORES DE REFERENCIA
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(grupo.resultados).map(
                          ([prueba, datos]: any, index: any) => (
                            <TableRow
                              key={prueba}
                              sx={{
                                border: "none",
                                borderBottom: "none",
                              }}
                            >
                              <TableCell
                                sx={{
                                  px: 2,
                                  py: 1,
                                  border: "none",
                                  borderBottom: "none",
                                  color: "#000",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight="700"
                                  sx={{ fontSize: "12px", color: "#000" }}
                                >
                                  {prueba}
                                </Typography>
                              </TableCell>
                              <TableCell
                                sx={{
                                  textAlign: "center",
                                  fontWeight: "900",
                                  border: "none",
                                  borderBottom: "none",
                                  fontSize: "12px",
                                  color: "#000",
                                  py: 1,
                                }}
                              >
                                {datos.resultado || "No registrado"}
                              </TableCell>
                              {examenSeleccionado.area !== "ORINA" && (
                                <TableCell
                                  sx={{
                                    textAlign: "center",
                                    border: "none",
                                    borderBottom: "none",
                                    fontSize: "11px",
                                    color: "#000",
                                    fontWeight: "500",
                                    py: 1,
                                  }}
                                >
                                  {determinarUnidad(datos.valorReferencia)}
                                </TableCell>
                              )}
                              <TableCell
                                sx={{
                                  textAlign: "center",
                                  border: "none",
                                  borderBottom: "none",
                                  fontSize: "11px",
                                  color: "#000",
                                  fontWeight: "500",
                                  py: 1,
                                }}
                              >
                                {datos.valorReferencia}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                </Box>
              ))}

              {/* Observaciones */}
              {examenSeleccionado.observaciones && (
                <Box
                  sx={{
                    mt: 2,
                    p: 1,
                    minHeight: "60px",
                  }}
                >
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    OBSERVACIONES:
                  </Typography>
                  <Box
                    sx={{
                      maxWidth: "100%",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontStyle: "italic",
                        lineHeight: 1.4,
                        wordBreak: "break-word",
                      }}
                    >
                      {examenSeleccionado.observaciones}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCerrarModal} color="inherit">
            Cerrar
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setModalVerAbierto(false);
              handleEditarExamen(examenSeleccionado);
            }}
          >
            Editar Examen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para Editar Examen */}
      <Dialog
        open={modalEditarAbierto}
        onClose={handleCerrarModal}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center">
              <Edit sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h5" fontWeight={600}>
                Editar Examen
              </Typography>
            </Box>
            <IconButton onClick={handleCerrarModal} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {examenSeleccionado && (
            <Box>
              {/* Información del Examen (solo lectura) */}
              <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Información del Examen
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Typography
                      sx={{ color: "#000" }}
                      variant="subtitle2"
                      fontWeight={600}
                    >
                      Paciente:
                    </Typography>
                    <Typography>
                      {examenSeleccionado.cliente?.nombre ?? "Dato eliminado"}
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography
                      sx={{ color: "#000" }}
                      variant="subtitle2"
                      fontWeight={600}
                    >
                      Cédula:
                    </Typography>
                    <Typography>
                      {examenSeleccionado.cliente?.cedula ?? "Dato eliminado"}
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography
                      sx={{ color: "#000" }}
                      variant="subtitle2"
                      fontWeight={600}
                    >
                      Dirección:
                    </Typography>
                    <Typography>
                      {examenSeleccionado.cliente?.direccion ??
                        "Dato eliminado"}
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography
                      sx={{ color: "#000" }}
                      variant="subtitle2"
                      fontWeight={600}
                    >
                      Tipo de Examen:
                    </Typography>
                    <Typography>{examenSeleccionado.tipoExamen}</Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography
                      sx={{ color: "#000" }}
                      variant="subtitle2"
                      fontWeight={600}
                    >
                      Área:
                    </Typography>
                    <Typography>{examenSeleccionado.area}</Typography>
                  </Grid>
                  <Grid size={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Estado</InputLabel>
                      <Select
                        value={examenSeleccionado.estado}
                        label="Estado"
                        onChange={(e) =>
                          setExamenSeleccionado({
                            ...examenSeleccionado,
                            estado: e.target.value,
                          })
                        }
                      >
                        <MenuItem value="Pendiente de entrega">
                          Pendiente de entrega
                        </MenuItem>
                        <MenuItem value="Entregado">Entregado</MenuItem>
                        <MenuItem value="Vencido">Vencido</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>

              {/* Modern Results Editor */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 3,
                  border: "2px solid",
                  borderColor: "success.light",
                  background:
                    "linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, rgba(5, 150, 105, 0.02) 100%)",
                }}
              >
                <Box
                  sx={{
                    textAlign: "center",
                    mb: 3,
                    py: 2,
                    borderRadius: 2,
                    background:
                      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight="800"
                    sx={{
                      color: "white",
                      letterSpacing: 0.5,
                    }}
                  >
                    EDITAR RESULTADOS - ÁREA DE: {examenSeleccionado.area}
                  </Typography>
                </Box>
                <TableContainer
                  sx={{
                    borderRadius: 2,
                    border: "2px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                  }}
                >
                  <Table
                    size="small"
                    sx={{ "& .MuiTableCell-root": { borderBottom: "none" } }}
                  >
                    <TableHead>
                      <TableRow
                        sx={{
                          background:
                            "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)",
                          borderBottom: "none",
                          "& .MuiTableCell-root": {
                            py: 2,
                          },
                        }}
                      >
                        <TableCell
                          sx={{
                            color: "success.dark",
                            fontWeight: 700,
                            width: "40%",
                            borderBottom: "none",
                            fontSize: "0.95rem",
                          }}
                        >
                          PRUEBA
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "success.dark",
                            fontWeight: 700,
                            width: "30%",
                            borderBottom: "none",
                            fontSize: "0.95rem",
                          }}
                        >
                          RESULTADO
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "success.dark",
                            fontWeight: 700,
                            width: "30%",
                            borderBottom: "none",
                            fontSize: "0.95rem",
                          }}
                        >
                          VALOR DE REFERENCIA
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(examenSeleccionado.resultados).map(
                        ([prueba, datos]: any, index: number) => (
                          <TableRow
                            key={prueba}
                            sx={{
                              borderBottom: "none",
                              backgroundColor:
                                index % 2 === 0
                                  ? "background.paper"
                                  : "action.hover",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <TableCell sx={{ borderBottom: "none", py: 2 }}>
                              <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                color="text.primary"
                              >
                                {prueba}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ borderBottom: "none", py: 2 }}>
                              <TextField
                                fullWidth
                                size="small"
                                value={datos.resultado}
                                onChange={(e) =>
                                  handleResultadoChange(prueba, e.target.value)
                                }
                                placeholder="Ingrese resultado"
                                variant="outlined"
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    "&.Mui-focused fieldset": {
                                      borderColor: "#000",
                                      borderWidth: 2,
                                    },
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ borderBottom: "none", py: 2 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                fontWeight={500}
                              >
                                {datos.valorReferencia}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* Observaciones Editables */}
              <Paper elevation={0} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Observaciones
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={examenSeleccionado.observaciones}
                  onChange={(e) =>
                    setExamenSeleccionado({
                      ...examenSeleccionado,
                      observaciones: e.target.value,
                    })
                  }
                  placeholder="Agregue observaciones adicionales..."
                  variant="outlined"
                />
              </Paper>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCerrarModal}
            color="inherit"
            disabled={editando}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardarEdicion}
            disabled={editando}
            startIcon={editando ? <CircularProgress size={20} /> : <Save />}
          >
            {editando ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Confirmación para Eliminar */}
      <Dialog
        open={modalConfirmacionAbierto}
        onClose={handleCerrarModalConfirmacion}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Warning color="warning" />
            <Typography variant="h6" fontWeight={600}>
              Confirmar Eliminación
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de que desea eliminar este examen? Esta acción no se
            puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCerrarModalConfirmacion} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmarEliminar}
            startIcon={<Delete />}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Éxito */}
      <Dialog
        open={modalExitoAbierto}
        onClose={handleCerrarModalExito}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircle color="success" />
            <Typography variant="h6" fontWeight={600}>
              Operación Exitosa
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>{mensajeExito}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="contained"
            onClick={handleCerrarModalExito}
            startIcon={<CheckCircle />}
          >
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ListaExamenes;
