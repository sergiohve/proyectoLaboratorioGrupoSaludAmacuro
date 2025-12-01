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
import { Edit, Delete, Person, Save, Close, Search, LocationOn, Warning } from "@mui/icons-material";
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
  const { clientes, loading, error, deleteCliente, updateCliente } = useClientes() as any;
  const [modalAbierto, setModalAbierto] = useState(false) as any;
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false) as any;
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
    return clientes.filter((cliente: any) =>
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
      [name]: value
    }));
  };

  const handleGuardar = async () => {
    if (!clienteEditando) return;

    // Validaciones
    if (!formData.nombre || !formData.cedula || !formData.edad || !formData.sexo || !formData.direccion) {
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
      const venezuelaTime = new Date(date.getTime() + (date.getTimezoneOffset() - venezuelaOffset) * 60000);
      
      const day = venezuelaTime.getUTCDate().toString().padStart(2, '0');
      const month = (venezuelaTime.getUTCMonth() + 1).toString().padStart(2, '0');
      const year = venezuelaTime.getUTCFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      return "Fecha inválida";
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
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
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

        {/* Barra de búsqueda */}
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
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </Box>

        <Box sx={{ overflow: "auto", width: { xs: "280px", sm: "auto" } }}>
          <Table aria-label="tabla de clientes" sx={{ whiteSpace: "nowrap", mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: "60px" }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    #
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: "200px" }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Paciente
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: "120px" }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Cédula
                  </Typography>
                </TableCell>
                <TableCell sx={{ width: "80px" }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Edad
                  </Typography>
                </TableCell>
                <TableCell sx={{ width: "100px" }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Sexo
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: "200px" }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Dirección
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: "120px" }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Fecha Registro
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ width: "100px" }}>
                  <Typography variant="subtitle2" fontWeight={600}>
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
                  <TableRow key={cliente._id} hover>
                    <TableCell>
                      <Typography fontSize="15px" fontWeight={500}>
                        {pagina * filasPorPagina + index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Person sx={{ mr: 1, color: "primary.main" }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {cliente.nombre}
                          </Typography>
                          <Typography color="textSecondary" fontSize="13px">
                            ID: {cliente._id.slice(-6)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                        {cliente.cedula}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={400}>
                        {cliente.edad} años
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        sx={{ px: "4px", fontWeight: 500 }}
                        size="small"
                        color={getSexoColor(cliente.sexo) as any}
                        label={cliente.sexo}
                      />
                    </TableCell>
                    <TableCell>
                       {cliente.direccion}
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={400}>
                        {formatDate(cliente.fecha)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleEdit(cliente)}
                        sx={{ mr: 0.5 }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleOpenEliminar(cliente)}
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

      {/* Modal de Edición */}
      <Dialog open={modalAbierto} onClose={handleCerrarModal} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" fontWeight={600}>
              Editar Paciente
            </Typography>
            <IconButton onClick={handleCerrarModal} size="small">
              <Close />
            </IconButton>
          </Box>
          {clienteEditando && (
            <Typography variant="body2" color="textSecondary">
              ID: {clienteEditando._id}
            </Typography>
          )}
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
              <Grid  container>
              <Grid  size={6}>
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

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleCerrarModal} startIcon={<Close />} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            variant="contained"
            startIcon={<Save />}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Confirmación de Eliminación */}
      <Dialog open={modalEliminarAbierto} onClose={handleCloseEliminar} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Warning color="error" />
            <Typography variant="h6" fontWeight={600}>
              Confirmar Eliminación
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography>
            ¿Está seguro de que desea eliminar al paciente{' '}
            <strong>{clienteAEliminar?.nombre}</strong> con cédula{' '}
            <strong>{clienteAEliminar?.cedula}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Esta acción no se puede deshacer. Todos los datos del paciente serán eliminados permanentemente.
          </Alert>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleCloseEliminar} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarEliminar}
            variant="contained"
            color="error"
            startIcon={<Delete />}
          >
            Eliminar Paciente
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClientesTable;