'use client'
import { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  MenuItem,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { PersonAdd, Save } from '@mui/icons-material';
import { useClientes } from '@/context/clientesContext';

interface ClienteForm {
  nombre: string;
  cedula: string;
  edad: string;
  sexo: string;
  fecha: string;
}
const obtenerFechaVenezuela = () => {
  const ahora = new Date();
 
  const offset = -4 * 60;
  const fechaVenezuela = new Date(ahora.getTime() + offset * 60 * 1000);
  return fechaVenezuela.toISOString().split("T")[0];
};
const AgregarCliente = () => {
      const { refreshClientes } = useClientes();
  const [formData, setFormData] = useState<ClienteForm>({
    nombre: '',
    cedula: '',
    edad: '',
    sexo: 'Masculino', // Valor por defecto
    fecha: obtenerFechaVenezuela()
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validaciones básicas
    if (!formData.nombre || !formData.cedula || !formData.edad || !formData.sexo) {
      setMessage({ type: 'error', text: 'Todos los campos son requeridos' });
      setLoading(false);
      return;
    }

    if (parseInt(formData.edad) < 1 || parseInt(formData.edad) > 120) {
      setMessage({ type: 'error', text: 'La edad debe estar entre 1 y 120 años' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://backinvent.onrender.com/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          edad: parseInt(formData.edad)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Cliente registrado exitosamente' });
        setFormData({
          nombre: '',
          cedula: '',
          edad: '',
          sexo: 'Masculino',
          fecha: new Date().toISOString().split('T')[0]
        });
        await refreshClientes()
        // Emitir evento para actualizar tabla y stats
        window.dispatchEvent(new Event('clienteAdded'));
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al registrar cliente' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión con el servidor' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <PersonAdd sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight={600}>
            Registrar Paciente
          </Typography>
        </Box>

        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Nombre Completo"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                size="small"
                placeholder="Ej: Juan Pérez García"
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
                placeholder="Ej: 123456789"
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
            <Grid size={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                startIcon={<Save />}
                sx={{ mt: 1, py: 1.5 }}
              >
                {loading ? 'Guardando...' : 'Guardar Paciente'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default AgregarCliente;