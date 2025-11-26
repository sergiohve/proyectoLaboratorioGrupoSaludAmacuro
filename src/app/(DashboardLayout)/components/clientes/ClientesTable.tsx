"use client";
import { useState } from "react";
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
} from "@mui/material";
import { Edit, Delete, Person, Save, Close } from "@mui/icons-material";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { useClientes } from "@/context/clientesContext";

interface Cliente {
  _id: string;
  nombre: string;
  cedula: string;
  edad: number;
  sexo: string;
  fecha: string;
  createdAt: string;
}

const ClientesTable = () => {
  const { clientes, loading, error, deleteCliente, updateCliente } =
    useClientes();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    cedula: "",
    edad: "",
    sexo: "",
    fecha: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(5);

  const handleChangePagina = (event: unknown, nuevaPagina: number) => {
    setPagina(nuevaPagina);
  };

  const handleChangeFilasPorPagina = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilasPorPagina(parseInt(event.target.value, 5));
    setPagina(0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este cliente?")) return;

    try {
      await deleteCliente(id);
    } catch (error) {
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
      fecha: cliente.fecha.split("T")[0], // Formato YYYY-MM-DD
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
      fecha: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGuardar = async () => {
    if (!clienteEditando) return;

    // Validaciones
    if (
      !formData.nombre ||
      !formData.cedula ||
      !formData.edad ||
      !formData.sexo
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
        fecha: formData.fecha,
      });
      handleCerrarModal();
    } catch (error) {
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
  // Si la fecha ya viene en formato UTC (con Z al final)
  // simplemente créala y usa los métodos UTC
  const date = new Date(dateString);
  
  console.log('Fecha original:', dateString);
  console.log('Fecha interpretada:', date);
  console.log('UTC Date:', date.getUTCDate());
  console.log('Local Date:', date.getDate());
  
  // Forzar la interpretación como UTC
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  
  const day = utcDate.getUTCDate().toString().padStart(2, '0');
  const month = (utcDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = utcDate.getUTCFullYear();
  
  return `${day}/${month}/${year}`;
};

  // Calcular clientes para la página actual
  const clientesPaginados = clientes.slice(
    pagina * filasPorPagina,
    pagina * filasPorPagina + filasPorPagina
  );

  if (loading) {
    return (
      <DashboardCard title="Lista de Clientes">
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
        title="Lista de Clientes"
        action={
          <Typography variant="body2" color="textSecondary">
            Total: {clientes.length}
          </Typography>
        }
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ overflow: "auto", width: { xs: "280px", sm: "auto" } }}>
          <Table
            aria-label="tabla de clientes"
            sx={{ whiteSpace: "nowrap", mt: 2 }}
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    ID
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Paciente
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Cédula
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Edad
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Sexo
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Fecha Registro
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
              {clientesPaginados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="textSecondary">
                      No hay pacientes registrados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                clientesPaginados.map((cliente, index) => (
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
                      <Typography
                        color="textSecondary"
                        variant="subtitle2"
                        fontWeight={400}
                      >
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
                      <Typography variant="subtitle2" fontWeight={400}>
                        {formatDate(cliente.fecha)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleEdit(cliente)}
                        sx={{ mr: 1 }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(cliente._id)}
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
          {clientes.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={clientes.length}
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
      <Dialog
        open={modalAbierto}
        onClose={handleCerrarModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h5" fontWeight={600}>
              Editar Cliente
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
              <Grid size={12}>
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
              <Grid size={12}>
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
              <Grid size={6}>
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
              <Grid size={12}>
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
          <Button
            onClick={handleCerrarModal}
            startIcon={<Close />}
            color="inherit"
          >
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
    </>
  );
};

export default ClientesTable;
