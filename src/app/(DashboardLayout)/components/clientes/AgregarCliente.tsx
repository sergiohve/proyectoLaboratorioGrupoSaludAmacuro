"use client";
import { useState } from "react";
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
} from "@mui/material";
import { PersonAdd, Save } from "@mui/icons-material";
import { useClientes } from "@/context/clientesContext";
import { useRouter } from "next/navigation";

interface ClienteForm {
  nombre: string;
  cedula: string;
  edadAnios: string;
  edadMeses: string;
  sexo: string;
  direccion: string;
  fecha: string;
}

const obtenerFechaVenezuela = () => {
  const ahora = new Date();
  const offset = -4 * 60;
  const fechaVenezuela = new Date(ahora.getTime() + offset * 60 * 1000);
  return fechaVenezuela.toISOString().split("T")[0];
};

const AgregarCliente = () => {
  const router = useRouter();
  const { refreshClientes } = useClientes();
  const [formData, setFormData] = useState<ClienteForm>({
    nombre: "",
    cedula: "",
    edadAnios: "",
    edadMeses: "",
    sexo: "Masculino",
    direccion: "",
    fecha: obtenerFechaVenezuela(),
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validaciones básicas
    if (
      !formData.nombre ||
      !formData.cedula ||
      !formData.sexo ||
      !formData.direccion
    ) {
      setMessage({ type: "error", text: "Todos los campos son requeridos" });
      setLoading(false);
      return;
    }

    // Validar que al menos años o meses estén ingresados
    if (!formData.edadAnios && !formData.edadMeses) {
      setMessage({
        type: "error",
        text: "Debe ingresar al menos años o meses de edad",
      });
      setLoading(false);
      return;
    }

    const anios = parseInt(formData.edadAnios) || 0;
    const meses = parseInt(formData.edadMeses) || 0;

    if (anios < 0 || anios > 120) {
      setMessage({
        type: "error",
        text: "Los años deben estar entre 0 y 120",
      });
      setLoading(false);
      return;
    }

    if (meses < 0 || meses > 11) {
      setMessage({
        type: "error",
        text: "Los meses deben estar entre 0 y 11",
      });
      setLoading(false);
      return;
    }

    // Calcular edad total en años (con decimales)
    const edadTotal = anios + (meses / 12);

    try {
      const response = await fetch(
        "https://backinvent.onrender.com/api/clientes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: formData.nombre,
            cedula: formData.cedula,
            edad: edadTotal,
            edadAnios: anios,
            edadMeses: meses,
            sexo: formData.sexo,
            direccion: formData.direccion,
            fecha: formData.fecha,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Cliente registrado exitosamente",
        });
        setFormData({
          nombre: "",
          cedula: "",
          edadAnios: "",
          edadMeses: "",
          sexo: "Masculino",
          direccion: "",
          fecha: obtenerFechaVenezuela(),
        });
        await refreshClientes();

        window.dispatchEvent(new Event("clienteAdded"));

        setTimeout(() => {
          router.push("/lista-clientes");
        }, 1000);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Error al registrar cliente",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión con el servidor" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{
      height: "100%",
      borderRadius: 3,
      boxShadow: '0 8px 32px -8px rgba(0,0,0,0.1)',
      border: '1px solid',
      borderColor: 'divider',
    }}>
      <CardContent sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={4} sx={{
          pb: 3,
          borderBottom: '2px solid',
          borderColor: 'primary.main',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
          mx: -4,
          px: 4,
          pt: 2,
        }}>
          <Box sx={{
            bgcolor: 'primary.main',
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
            mr: 2,
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
          }}>
            <PersonAdd sx={{ color: "white", fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Registrar Paciente
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Complete el formulario con los datos del paciente
            </Typography>
          </Box>
        </Box>

        {message && (
          <Alert
            severity={message.type}
            sx={{
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: 24
              }
            }}
          >
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
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
            
            <Grid size={4}>
              <TextField
                fullWidth
                label="Años"
                name="edadAnios"
                type="number"
                value={formData.edadAnios}
                onChange={handleChange}
                size="small"
                placeholder="0-120"
                inputProps={{ min: 0, max: 120 }}
              />
            </Grid>

            <Grid size={2}>
              <TextField
                fullWidth
                label="Meses"
                name="edadMeses"
                type="number"
                value={formData.edadMeses}
                onChange={handleChange}
                size="small"
                placeholder="0-11"
                inputProps={{ min: 0, max: 11 }}
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
                label="Dirección"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                required
                size="small"
                multiline
                rows={2}
                placeholder="Ej: Av. Principal, Edificio Los Robles, Piso 3, Apt 3-A, Caracas"
              />
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
                sx={{
                  mt: 2,
                  py: 1.8,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: 2,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 8px 24px -8px rgba(99, 102, 241, 0.5)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    boxShadow: '0 12px 32px -8px rgba(99, 102, 241, 0.7)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                  }
                }}
              >
                {loading ? "Guardando..." : "Guardar Paciente"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default AgregarCliente;