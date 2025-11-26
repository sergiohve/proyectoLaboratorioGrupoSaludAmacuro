import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from '@mui/material/styles';
import { Stack, Typography, Avatar, Fab, Box, Card, CardContent } from '@mui/material';
import { IconArrowUpRight, IconUserPlus, IconTrendingUp } from '@tabler/icons-react';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useClientes } from "@/context/clientesContext";

const RegistrosRecientes = () => {
  const { clientes } = useClientes();
  const theme = useTheme();
  
  // chart color
  const primary = theme.palette.primary.main;
  const primarylight = theme.palette.primary.light;
  const success = theme.palette.success.main;
  const error = theme.palette.error.main;

  // Calcular tendencia de registros (últimos 7 días)
  const calcularTendencia = () => {
    const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - (6 - i));
      return fecha;
    });

    const registrosPorDia = ultimos7Dias.map(fecha => {
      return clientes.filter(cliente => {
        const fechaCliente = new Date(cliente.fecha);
        return fechaCliente.toDateString() === fecha.toDateString();
      }).length;
    });

    return registrosPorDia;
  };

  const tendencia = calcularTendencia();
  const registrosHoy = tendencia[tendencia.length - 1] || 0;
  const registrosAyer = tendencia[tendencia.length - 2] || 0;
  const crecimiento = registrosAyer > 0 
    ? Math.round(((registrosHoy - registrosAyer) / registrosAyer) * 100) 
    : registrosHoy > 0 ? 100 : 0;

  const isCrecimientoPositivo = crecimiento >= 0;

  // chart options
  const optionscolumnchart: any = {
    chart: {
      type: 'area',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: {
        show: false,
      },
      height: 80,
      sparkline: {
        enabled: true,
      },
    },
    stroke: {
      curve: 'smooth',
      width: 2,
      colors: [primary],
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 80, 100]
      },
      colors: [primarylight],
    },
    markers: {
      size: 0,
    },
    tooltip: {
      theme: theme.palette.mode,
      x: {
        show: false,
      },
    },
    grid: {
      show: false,
    },
    yaxis: {
      show: false,
    },
    xaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        show: false,
      },
    },
  };
  
  const seriescolumnchart: any = [
    {
      name: 'Registros',
      data: tendencia,
    },
  ];

  return (
    <DashboardCard
      title={
        <Box display="flex" alignItems="center" gap={1}>
          <IconTrendingUp size={20} />
          <Typography variant="h6" fontWeight="600">
            Registros Diarios
          </Typography>
        </Box>
      }
      action={
        <Fab 
          color="primary" 
          size="medium" 
          sx={{
            color: '#ffffff',
            boxShadow: theme.shadows[3],
            '&:hover': {
              boxShadow: theme.shadows[6],
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <IconUserPlus width={20} />
        </Fab>
      }
    >
      <CardContent>
        <Stack spacing={3}>
          {/* Main Stats */}
          <Box>
            <Typography variant="h2" fontWeight="700" color="primary">
              {registrosHoy}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" fontWeight="500">
              Registros Hoy
            </Typography>
          </Box>

          {/* Growth Indicator */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ 
              bgcolor: isCrecimientoPositivo ? `${success}15` : `${error}15`, 
              color: isCrecimientoPositivo ? success : error,
              width: 32, 
              height: 32 
            }}>
              <IconArrowUpRight 
                width={18} 
                style={{ 
                  transform: isCrecimientoPositivo ? 'none' : 'rotate(90deg)' 
                }} 
              />
            </Avatar>
            <Box>
              <Typography 
                variant="subtitle1" 
                fontWeight="600" 
                color={isCrecimientoPositivo ? success : error}
              >
                {isCrecimientoPositivo ? '+' : ''}{crecimiento}%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                vs. ayer
              </Typography>
            </Box>
          </Stack>

          {/* Mini Chart */}
          <Box sx={{ mt: 2 }}>
            <Chart
              options={optionscolumnchart}
              series={seriescolumnchart}
              type="area"
              height={80}
              width={"100%"}
            />
          </Box>

          {/* Additional Info */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="textSecondary">
              Promedio 7 días: {Math.round(tendencia.reduce((a, b) => a + b, 0) / 7)}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Total: {clientes.length}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </DashboardCard>
  );
};

export default RegistrosRecientes;