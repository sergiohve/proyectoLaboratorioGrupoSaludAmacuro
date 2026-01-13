"use client";
import { useState, useMemo } from "react";
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
  TextField,
  Button,
  Grid,
  MenuItem,
  TablePagination,
  InputAdornment,
  Tooltip,
  Card,
  CardContent,
} from "@mui/material";
import {
  Edit,
  Delete,
  Person,
  Save,
  Close,
  Search,
  LocationOn,
  Warning,
} from "@mui/icons-material";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { useClientes } from "@/context/clientesContext";

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

interface FormData {
  nombre: string;
  cedula: string;
  edad: string;
  sexo: string;
  direccion: string;
  fecha: string;
}

const ClientesTable = () => {
  const { clientes, loading, error, deleteCliente, updateCliente } =
    useClientes() as any;
  const [modalAbierto, setModalAbierto] = useState(false) as any;
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(
    false
  ) as any;
  const [clienteEditando, setClienteEditando] = useState<any | null>(null);
  const [clienteAEliminar, setClienteAEliminar] = useState<any | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    cedula: "",
    edad: "",
    sexo: "",
    direccion: "",
    fecha: "",
  }) as any;
  const [guardando, setGuardando] = useState(false) as any;
  const [pagina, setPagina] = useState(0) as any;
  const [filasPorPagina, setFilasPorPagina] = useState(5) as any;
  const [terminoBusqueda, setTerminoBusqueda] = useState("") as any;

  // Función para manejar la búsqueda
  const handleBusquedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTerminoBusqueda(e.target.value);
    setPagina(0);
  };

  // Filtrar clientes basado en el término de búsqueda
  const clientesFiltrados = useMemo(() => {
    if (!terminoBusqueda) return clientes;

    const termino = terminoBusqueda.toLowerCase();
    return clientes.filter(
      (cliente: any) =>
        cliente.nombre.toLowerCase().includes(termino) ||
        cliente.cedula.toLowerCase().includes(termino) ||
        cliente.sexo.toLowerCase().includes(termino) ||
        cliente.direccion.toLowerCase().includes(termino) ||
        cliente.edad.toString().includes(termino) ||
        cliente._id.toLowerCase().includes(termino)
    );
  }, [clientes, terminoBusqueda]);

  const handleChangePagina = (_event: unknown, nuevaPagina: number) => {
    setPagina(nuevaPagina);
  };

  const handleChangeFilasPorPagina = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilasPorPagina(parseInt(event.target.value, 10));
    setPagina(0);
  };

  const handleOpenEliminar = (cliente: Cliente) => {
    setClienteAEliminar(cliente);
    setModalEliminarAbierto(true);
  };

  const handleCloseEliminar = () => {
    setModalEliminarAbierto(false);
    setClienteAEliminar(null);
  };

  const handleConfirmarEliminar = async () => {
    if (!clienteAEliminar) return;

    try {
      await deleteCliente(clienteAEliminar._id);
      handleCloseEliminar();
    } catch (error) {
      console.error("Error al eliminar el cliente:", error);
      alert("Error al eliminar el cliente");
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setClienteEditando(cliente);
    setFormData({
      nombre: cliente.nombre,
      cedula: cliente.cedula,
      edad: cliente.edad.toString(),
      sexo: cliente.sexo,
      direccion: cliente.direccion,
      fecha: cliente.fecha.split("T")[0],
    });
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setClienteEditando(null);
    setFormData({
      nombre: "",
      cedula: "",
      edad: "",
      sexo: "",
      direccion: "",
      fecha: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGuardar = async () => {
    if (!clienteEditando) return;

    // Validaciones
    if (
      !formData.nombre ||
      !formData.cedula ||
      !formData.edad ||
      !formData.sexo ||
      !formData.direccion
    ) {
      alert("Todos los campos son requeridos");
      return;
    }

    const edadNum = parseInt(formData.edad);
    if (edadNum < 1 || edadNum > 120) {
      alert("La edad debe estar entre 1 y 120 años");
      return;
    }

    setGuardando(true);
    try {
      await updateCliente(clienteEditando._id, {
        nombre: formData.nombre,
        cedula: formData.cedula,
        edad: edadNum,
        sexo: formData.sexo,
        direccion: formData.direccion,
        fecha: formData.fecha,
      });
      handleCerrarModal();
    } catch (error) {
      console.error("Error al actualizar el cliente:", error);
      alert("Error al actualizar el cliente");
    } finally {
      setGuardando(false);
    }
  };

  const getSexoColor = (sexo: string) => {
    switch (sexo) {
      case "Masculino":
        return "primary";
      case "Femenino":
        return "secondary";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);

      // Ajustar a hora de Venezuela (UTC-4)
      const venezuelaOffset = -4 * 60;
      const venezuelaTime = new Date(
        date.getTime() + (date.getTimezoneOffset() - venezuelaOffset) * 60000
      );

      const day = venezuelaTime.getUTCDate().toString().padStart(2, "0");
      const month = (venezuelaTime.getUTCMonth() + 1)
        .toString()
        .padStart(2, "0");
      const year = venezuelaTime.getUTCFullYear();

      return `${day}/${month}/${year}`;
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Función para formatear la edad desde decimal a años y meses
  const formatEdad = (edadDecimal: number) => {
    const anios = Math.floor(edadDecimal);
    const meses = Math.round((edadDecimal - anios) * 12);

    if (anios === 0) {
      return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    } else if (meses === 0) {
      return `${anios} ${anios === 1 ? 'año' : 'años'}`;
    } else {
      return `${anios} ${anios === 1 ? 'año' : 'años'} ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    }
  };

  // Calcular clientes para la página actual
  const clientesPaginados = clientesFiltrados.slice(
    pagina * filasPorPagina,
    pagina * filasPorPagina + filasPorPagina
  );

  if (loading) {
    return (
      <DashboardCard title="Lista de Pacientes">
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
        title="Lista de Pacientes"
        action={
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="textSecondary">
              Total: {clientesFiltrados.length}
              {terminoBusqueda && ` (filtrados)`}
            </Typography>
          </Box>
        }
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Modern Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por nombre, cédula, dirección, sexo, edad o ID..."
            value={terminoBusqueda}
            onChange={handleBusquedaChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "primary.main" }} />
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
                  boxShadow: "0 4px 20px rgba(99, 102, 241, 0.15)",
                  "& fieldset": {
                    borderWidth: 2,
                    borderColor: "primary.main",
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
        </Box>

        <Box
          sx={{
            overflow: "auto",
            width: { xs: "280px", sm: "auto" },
            borderRadius: 3,
            border: "2px solid",
            borderColor: "divider",
          }}
        >
          <Table aria-label="tabla de clientes" sx={{ whiteSpace: "nowrap" }}>
            <TableHead>
              <TableRow
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)",
                  "& .MuiTableCell-root": {
                    borderBottom: "2px solid",
                    borderColor: "primary.main",
                    py: 2,
                  },
                }}
              >
                <TableCell sx={{ width: "60px" }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="primary.main"
                  >
                  
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: "200px" }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="primary.main"
                  >
                    Paciente
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: "120px" }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="primary.main"
                  >
                    Cédula
                  </Typography>
                </TableCell>
                <TableCell sx={{ width: "80px" }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="primary.main"
                  >
                    Edad
                  </Typography>
                </TableCell>
                <TableCell sx={{ width: "100px" }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="primary.main"
                  >
                    Sexo
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: "200px" }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="primary.main"
                  >
                    Dirección
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: "120px" }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="primary.main"
                  >
                    Fecha Registro
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ width: "100px" }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="primary.main"
                  >
                    Acciones
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientesPaginados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary">
                      {terminoBusqueda
                        ? "No se encontraron pacientes que coincidan con la búsqueda"
                        : "No hay pacientes registrados"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                clientesPaginados.map((cliente: any, index: number) => (
                  <TableRow
                    key={cliente._id}
                    sx={{
                      position: "relative",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        backgroundColor: "rgba(99, 102, 241, 0.04)",
                        transform: "translateX(4px)",
                        boxShadow: "0 4px 20px rgba(99, 102, 241, 0.12)",
                        "& .MuiTableCell-root": {
                          borderColor: "primary.light",
                        },
                        "&::before": {
                          opacity: 1,
                        },
                      },
                      "&:last-child td": {
                        borderBottom: 0,
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: "4px",
                        background:
                          "linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)",
                        opacity: 0,
                        transition: "opacity 0.3s ease",
                      },
                    }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background:
                              "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
                            border: "2px solid",
                            borderColor: "primary.light",
                            fontWeight: 700,
                            fontSize: "14px",
                            color: "primary.main",
                          }}
                        >
                          {" "}
                          {pagina * filasPorPagina + index + 1}{" "}
                        </Box>
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 2.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background:
                              "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                            color: "white",
                            fontWeight: 800,
                            fontSize: "16px",
                          }}
                        >
                          {cliente.nombre.charAt(0).toUpperCase()}
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            fontWeight={700}
                            sx={{
                              background:
                                "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
                              backgroundClip: "text",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            {cliente.nombre}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              mt: 0.25,
                            }}
                          >
                            <Box
                              sx={{
                                width: 4,
                                height: 4,
                                borderRadius: "50%",
                                bgcolor: "success.main",
                                animation: "pulse 2s ease-in-out infinite",
                                "@keyframes pulse": {
                                  "0%, 100%": { opacity: 1 },
                                  "50%": { opacity: 0.5 },
                                },
                              }}
                            />
                            <Typography
                              color="text.secondary"
                              fontSize="12px"
                              fontWeight={500}
                            >
                              ID: {cliente._id.slice(-6)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          px: 1.5,
                          py: 0.75,
                          borderRadius: 2,
                          bgcolor: "rgba(99, 102, 241, 0.08)",
                          border: "1px solid",
                          borderColor: "primary.light",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          color="primary.main"
                          fontSize="13px"
                        >
                          {cliente.cedula}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          px: 1.5,
                          py: 0.75,
                          borderRadius: 2,
                          bgcolor: "rgba(16, 185, 129, 0.08)",
                          border: "1px solid",
                          borderColor: "success.light",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          color="success.main"
                          fontSize="13px"
                        >
                          {formatEdad(cliente.edad)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={cliente.sexo}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: "12px",
                          height: 28,
                          px: 1.5,
                          background:
                            cliente.sexo === "Masculino"
                              ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                              : cliente.sexo === "Femenino"
                              ? "linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
                              : "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                          color: "white",
                          boxShadow:
                            cliente.sexo === "Masculino"
                              ? "0 2px 8px rgba(59, 130, 246, 0.3)"
                              : cliente.sexo === "Femenino"
                              ? "0 2px 8px rgba(236, 72, 153, 0.3)"
                              : "0 2px 8px rgba(139, 92, 246, 0.3)",
                          border: "none",
                          "& .MuiChip-label": {
                            px: 0,
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={cliente.direccion} placement="top">
                        <Box display="flex" alignItems="flex-start" gap={0.5}>
                          <LocationOn
                            sx={{
                              fontSize: 16,
                              color: "text.secondary",
                              mt: 0.25,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color: "text.secondary",
                              fontWeight: 500,
                            }}
                          >
                            {cliente.direccion}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          px: 1.5,
                          py: 0.75,
                          borderRadius: 2,
                          bgcolor: "rgba(245, 158, 11, 0.08)",
                          border: "1px solid",
                          borderColor: "warning.light",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          color="warning.main"
                          fontSize="13px"
                        >
                          {formatDate(cliente.fecha)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: "center",
                        }}
                      >
                        <Tooltip title="Editar paciente" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(cliente)}
                            sx={{
                              width: 36,
                              height: 36,
                              background:
                                "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                              color: "white",
                              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                              "&:hover": {
                                background:
                                  "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                                transform: "translateY(-2px) scale(1.05)",
                                boxShadow: "0 6px 16px rgba(99, 102, 241, 0.4)",
                              },
                              transition:
                                "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar paciente" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEliminar(cliente)}
                            sx={{
                              width: 36,
                              height: 36,
                              background:
                                "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                              color: "white",
                              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                              "&:hover": {
                                background:
                                  "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                                transform: "translateY(-2px) scale(1.05)",
                                boxShadow: "0 6px 16px rgba(239, 68, 68, 0.4)",
                              },
                              transition:
                                "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Paginación */}
          {clientesFiltrados.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={clientesFiltrados.length}
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
        </Box>
      </DashboardCard>

      {/* Modern Edit Modal */}
      <Dialog
        open={modalAbierto}
        onClose={handleCerrarModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            color: "white",
            pb: 3,
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Edit />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={800}>
                  Editar Paciente
                </Typography>
                {clienteEditando && (
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                    ID: {clienteEditando._id}
                  </Typography>
                )}
              </Box>
            </Box>
            <IconButton
              onClick={handleCerrarModal}
              size="small"
              sx={{
                color: "white",
                bgcolor: "rgba(255,255,255,0.2)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.3)",
                  transform: "rotate(90deg)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid>
                <TextField
                  fullWidth
                  label="Nombre Completo"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  size="small"
                />
              </Grid>

              <Grid>
                <TextField
                  fullWidth
                  label="Cédula"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  required
                  size="small"
                />
              </Grid>
              <Grid container>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label="Edad"
                    name="edad"
                    type="number"
                    value={formData.edad}
                    onChange={handleChange}
                    required
                    size="small"
                    inputProps={{ min: 1, max: 120 }}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Sexo"
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleChange}
                    required
                    size="small"
                  >
                    <MenuItem value="Masculino">Masculino</MenuItem>
                    <MenuItem value="Femenino">Femenino</MenuItem>
                    <MenuItem value="Otro">Otro</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
              <Grid>
                <TextField
                  fullWidth
                  label="Dirección"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  required
                  size="small"
                  multiline
                  rows={3}
                  placeholder="Dirección completa del paciente"
                />
              </Grid>

              <Grid>
                <TextField
                  fullWidth
                  label="Fecha de Registro"
                  name="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            gap: 1,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(99, 102, 241, 0.04) 100%)",
          }}
        >
          <Button
            onClick={handleCerrarModal}
            startIcon={<Close />}
            sx={{
              px: 3,
              py: 1.2,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              color: "text.secondary",
              border: "2px solid",
              borderColor: "divider",
              "&:hover": {
                borderColor: "text.secondary",
                bgcolor: "action.hover",
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            variant="contained"
            startIcon={
              guardando ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Save />
              )
            }
            disabled={guardando}
            sx={{
              px: 3,
              py: 1.2,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              boxShadow: "0 4px 16px rgba(99, 102, 241, 0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                boxShadow: "0 6px 20px rgba(99, 102, 241, 0.5)",
                transform: "translateY(-2px)",
              },
              "&:disabled": {
                background: "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)",
              },
              transition: "all 0.3s ease",
            }}
          >
            {guardando ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modern Delete Confirmation Modal */}
      <Dialog
        open={modalEliminarAbierto}
        onClose={handleCloseEliminar}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 20px 60px rgba(239, 68, 68, 0.3)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            color: "white",
            pb: 3,
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Warning sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800}>
                Confirmar Eliminación
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Esta acción es irreversible
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: "rgba(239, 68, 68, 0.05)",
              border: "2px solid",
              borderColor: "rgba(239, 68, 68, 0.2)",
              mb: 2,
            }}
          >
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
              ¿Está seguro de que desea eliminar al paciente{" "}
              <Box
                component="span"
                sx={{
                  fontWeight: 800,
                  color: "error.main",
                  px: 0.5,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: "rgba(239, 68, 68, 0.1)",
                }}
              >
                {clienteAEliminar?.nombre}
              </Box>{" "}
              con cédula{" "}
              <Box
                component="span"
                sx={{
                  fontWeight: 700,
                  color: "error.main",
                }}
              >
                {clienteAEliminar?.cedula}
              </Box>
              ?
            </Typography>
          </Box>

          <Alert
            severity="error"
            icon={<Warning />}
            sx={{
              borderRadius: 2,
              border: "2px solid",
              borderColor: "error.light",
              "& .MuiAlert-icon": {
                fontSize: 24,
              },
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              ⚠️ Advertencia: Esta acción no se puede deshacer. Todos los datos
              del paciente serán eliminados permanentemente.
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            gap: 1,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(239, 68, 68, 0.04) 100%)",
          }}
        >
          <Button
            onClick={handleCloseEliminar}
            sx={{
              px: 3,
              py: 1.2,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              color: "text.secondary",
              border: "2px solid",
              borderColor: "divider",
              "&:hover": {
                borderColor: "text.secondary",
                bgcolor: "action.hover",
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarEliminar}
            variant="contained"
            startIcon={<Delete />}
            sx={{
              px: 3,
              py: 1.2,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              boxShadow: "0 4px 16px rgba(239, 68, 68, 0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                boxShadow: "0 6px 20px rgba(239, 68, 68, 0.5)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Eliminar Paciente
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClientesTable;
