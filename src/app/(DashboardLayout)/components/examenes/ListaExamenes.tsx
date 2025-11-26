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
} from "@mui/icons-material";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Image from "next/image";

interface Examen {
  _id: string;
  cliente: {
    _id: string;
    nombre: string;
    cedula: string;
    edad: number;
    sexo: string;
  };
  tipoExamen: string;
  area: string;
  resultados: { [key: string]: { resultado: string; valorReferencia: string } };
  observaciones: string;
  fechaExamen: string;
  estado: string;
  createdAt: string;
}

interface Cliente {
  _id: string;
  nombre: string;
  cedula: string;
  edad: number;
  sexo: string;
}

const ListaExamenes = () => {
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [examenesFiltrados, setExamenesFiltrados] = useState<Examen[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVerAbierto, setModalVerAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [modalConfirmacionAbierto, setModalConfirmacionAbierto] = useState(false);
  const [modalExitoAbierto, setModalExitoAbierto] = useState(false);
  const [examenSeleccionado, setExamenSeleccionado] = useState<Examen | null>(null);
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

  const fetchExamenes = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://backinvent.onrender.com/api/examenes");
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
      const response = await fetch("https://backinvent.onrender.com/api/clientes");
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
          examen.tipoExamen.toLowerCase().includes(termino) ||
          examen.area.toLowerCase().includes(termino)
      );
      setExamenesFiltrados(filtrados);
    }
    setPagina(0);
  }, [terminoBusqueda, examenes]);

  const handleChangePagina = (event: unknown, nuevaPagina: number) => {
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
      const response = await fetch(`https://backinvent.onrender.com/api/examenes/${examenAEliminar}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setExamenes(examenes.filter((examen) => examen._id !== examenAEliminar));
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
    
    const day = utcDate.getUTCDate().toString().padStart(2, '0');
    const month = (utcDate.getUTCMonth() + 1).toString().padStart(2, '0');
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

      const fileName = `Examen_${examenSeleccionado.cliente.nombre.replace(
        /\s+/g,
        "_"
      )}_${examenSeleccionado.tipoExamen.replace(
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

        {/* Campo de Búsqueda */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Buscar por cédula, nombre del paciente, tipo de examen o área..."
            value={terminoBusqueda}
            onChange={handleBusquedaChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
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

        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
          <Table
            aria-label="tabla de exámenes"
            sx={{ whiteSpace: "nowrap" }}
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Paciente
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Examen
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Fecha
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Estado
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2" fontWeight={600}>
                    Acciones
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {examenesPaginados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      {terminoBusqueda
                        ? "No se encontraron exámenes que coincidan con la búsqueda"
                        : "No hay exámenes registrados"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                examenesPaginados.map((examen) => (
                  <TableRow key={examen._id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <MedicalServices
                          sx={{ mr: 1, color: "primary.main" }}
                        />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {examen?.cliente?.nombre}
                          </Typography>
                          <Typography color="textSecondary" fontSize="13px">
                            CI: {examen?.cliente?.cedula}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={400}>
                        {examen?.tipoExamen}
                      </Typography>
                      <Typography color="textSecondary" fontSize="12px">
                        {examen?.area}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={400}>
                        {formatDate(examen?.fechaExamen)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 180 }}>
                        <Select
                          value={examen?.estado}
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
                    <TableCell align="center">
                      <IconButton
                        color="info"
                        size="small"
                        onClick={() => handleVerExamen(examen)}
                        sx={{ mr: 1 }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleEditarExamen(examen)}
                        sx={{ mr: 1 }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteClick(examen._id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Paginación */}
          {examenesFiltrados?.length > 0 && (
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
                borderTop: "1px solid",
                borderColor: "divider",
                "& .MuiTablePagination-toolbar": {
                  padding: 1,
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
                {generandoPDF ? "Generando..." : "PDF"}
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
                p: 1,
                backgroundColor: "white",
                fontFamily: "Arial, sans-serif",
              }}
            >
              {/* Encabezado del PDF - Estilo similar a la imagen */}
              <Box sx={{ borderBottom: "2px solid #000", pb: 1, mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 1,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ fontSize: "16px", lineHeight: 1.2 }}
                    >
                      RIF J-30857988-2
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      sx={{ fontSize: "18px", lineHeight: 1.2 }}
                    >
                      LABORATORIO CLÍNICO
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ fontSize: "16px", lineHeight: 1.2 }}
                    >
                      LIC. Vivian Fagre
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "center", flex: 1 }}>
                    <Image
                      src="/images/logos/dark-logo.png"
                      alt="logo"
                      height={80}
                      width={174}
                      priority
                      style={{ margin: "0 auto" }}
                    />
                  </Box>
                  <Box sx={{ flex: 1, textAlign: "right" }}>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "12px", lineHeight: 1.2 }}
                    >
                      Página 1 de 1
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Información del Paciente */}
              <Box sx={{ mb: 2 }}>
                <Table size="small" sx={{ border: "none", mb: 1 }}>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        sx={{
                          border: "none",
                          p: 0,
                          width: "20%",
                          fontWeight: "bold",
                        }}
                      >
                        PACIENTE:
                      </TableCell>
                      <TableCell sx={{ border: "none", p: 0, width: "30%" }}>
                        {examenSeleccionado.cliente.nombre.toUpperCase()}
                      </TableCell>
                      <TableCell
                        sx={{
                          border: "none",
                          p: 0,
                          width: "15%",
                          fontWeight: "bold",
                        }}
                      >
                        C.I.:
                      </TableCell>
                      <TableCell sx={{ border: "none", p: 0, width: "35%" }}>
                        {examenSeleccionado.cliente.cedula}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{ border: "none", p: 0, fontWeight: "bold" }}
                      >
                        EDAD:
                      </TableCell>
                      <TableCell sx={{ border: "none", p: 0 }}>
                        {examenSeleccionado.cliente.edad} años
                      </TableCell>
                      <TableCell
                        sx={{ border: "none", p: 0, fontWeight: "bold" }}
                      >
                        CONVENIO:
                      </TableCell>
                      <TableCell sx={{ border: "none", p: 0 }}>
                        PARTICULAR
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{ border: "none", p: 0, fontWeight: "bold" }}
                      >
                        GÉNERO:
                      </TableCell>
                      <TableCell sx={{ border: "none", p: 0 }}>
                        {examenSeleccionado.cliente.sexo === "M"
                          ? "MASCULINO"
                          : examenSeleccionado.cliente.sexo === "F"
                          ? "FEMENINO"
                          : examenSeleccionado.cliente.sexo.toUpperCase()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{ border: "none", p: 0, fontWeight: "bold" }}
                      >
                        FECHA MUESTRA:
                      </TableCell>
                      <TableCell sx={{ border: "none", p: 0 }}>
                        {formatDate(examenSeleccionado.fechaExamen)}
                      </TableCell>
                      <TableCell
                        sx={{ border: "none", p: 0, fontWeight: "bold" }}
                      >
                        FECHA REPORTE:
                      </TableCell>
                      <TableCell sx={{ border: "none", p: 0 }}>
                        {formatDate(new Date().toISOString())}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{ border: "none", p: 0, fontWeight: "bold" }}
                      >
                        N° ORDEN:
                      </TableCell>
                      <TableCell sx={{ border: "none", p: 0 }}>
                        {examenesFiltrados?.length + 1}
                      </TableCell>
                      <TableCell sx={{ border: "none", p: 0 }}></TableCell>
                      <TableCell sx={{ border: "none", p: 0 }}></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>

              {/* Título ESPECIALES */}
              <Box sx={{ textAlign: "center", mb: 1 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{
                    fontSize: "16px",
                    backgroundColor: "#f0f0f0",
                    py: 0.5,
                    border: "1px solid #000",
                  }}
                >
                  Resultados
                </Typography>
              </Box>

              {/* Tabla de Resultados */}
              <TableContainer>
                <Table size="small" sx={{ border: "1px solid #000" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          border: "1px solid #000",
                          fontWeight: "bold",
                          textAlign: "center",
                          backgroundColor: "#f0f0f0",
                          width: "50%",
                        }}
                      >
                        DESCRIPCIÓN DE EXAMEN
                      </TableCell>
                      <TableCell
                        sx={{
                          border: "1px solid #000",
                          fontWeight: "bold",
                          textAlign: "center",
                          backgroundColor: "#f0f0f0",
                          width: "15%",
                        }}
                      >
                        RESULTADO
                      </TableCell>
                      <TableCell
                        sx={{
                          border: "1px solid #000",
                          fontWeight: "bold",
                          textAlign: "center",
                          backgroundColor: "#f0f0f0",
                          width: "15%",
                        }}
                      >
                        UNIDADES
                      </TableCell>
                      <TableCell
                        sx={{
                          border: "1px solid #000",
                          fontWeight: "bold",
                          textAlign: "center",
                          backgroundColor: "#f0f0f0",
                          width: "20%",
                        }}
                      >
                        VALORES DE REFERENCIA
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(examenSeleccionado.resultados).map(
                      ([prueba, datos], index) => (
                        <TableRow key={prueba}>
                          <TableCell sx={{ border: "1px solid #000", pl: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {prueba}
                            </Typography>
                            {index === 0 && (
                              <Typography
                                variant="caption"
                                sx={{ fontStyle: "italic" }}
                              >
                                MÉTODO: Elsa
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell
                            sx={{
                              border: "1px solid #000",
                              textAlign: "center",
                              fontWeight: "bold",
                            }}
                          >
                            {datos.resultado || "No registrado"}
                          </TableCell>
                          <TableCell
                            sx={{
                              border: "1px solid #000",
                              textAlign: "center",
                            }}
                          >
                            U/mL
                          </TableCell>
                          <TableCell
                            sx={{
                              border: "1px solid #000",
                              textAlign: "center",
                            }}
                          >
                            {datos.valorReferencia}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Información de Contacto */}
              <Box
                sx={{
                  mt: 2,
                  textAlign: "center",
                  borderTop: "1px solid #000",
                  pt: 1,
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  Calle Tucupita, Local 16, Nro 2, Centro, Tucupita, Edo. Delta Amacuro.
                </Typography>
                <Typography variant="body2">
                  Teléfonos: +58 424-9016271
                </Typography>
                {/* <Typography variant="body2">
                  Correo: laboratorio.citologicoguzmanhmv@gmail.com
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ mt: 1, display: "block", fontStyle: "italic" }}
                >
                  Ingreso por el Sistema de Control de Exámenes Citológicos
                  (SICODEC)
                </Typography> */}
              </Box>

              {/* Observaciones */}
              {examenSeleccionado.observaciones && (
                <Box
                  sx={{
                    mt: 2,
                    p: 1,
                    border: "1px solid #000",
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
              handleEditarExamen(examenSeleccionado!);
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
                  <Grid size={6}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Paciente:
                    </Typography>
                    <Typography>{examenSeleccionado.cliente.nombre}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Tipo de Examen:
                    </Typography>
                    <Typography>{examenSeleccionado.tipoExamen}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Área:
                    </Typography>
                    <Typography>{examenSeleccionado.area}</Typography>
                  </Grid>
                  <Grid size={6}>
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

              {/* Edición de Resultados */}
              <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  color="primary"
                  align="center"
                >
                  EDITAR RESULTADOS - ÁREA DE: {examenSeleccionado.area}
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "primary.main" }}>
                        <TableCell
                          sx={{ color: "white", fontWeight: 600, width: "40%" }}
                        >
                          PRUEBA
                        </TableCell>
                        <TableCell
                          sx={{ color: "white", fontWeight: 600, width: "30%" }}
                        >
                          RESULTADO
                        </TableCell>
                        <TableCell
                          sx={{ color: "white", fontWeight: 600, width: "30%" }}
                        >
                          VALOR DE REFERENCIA
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(examenSeleccionado.resultados).map(
                        ([prueba, datos]) => (
                          <TableRow key={prueba} hover>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {prueba}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                size="small"
                                value={datos.resultado}
                                onChange={(e) =>
                                  handleResultadoChange(prueba, e.target.value)
                                }
                                placeholder="Ingrese resultado"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                color="text.secondary"
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
            ¿Está seguro de que desea eliminar este examen? Esta acción no se puede deshacer.
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