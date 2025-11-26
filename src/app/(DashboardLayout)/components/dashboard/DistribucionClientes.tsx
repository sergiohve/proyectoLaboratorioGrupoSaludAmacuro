import { useTheme } from '@mui/material/styles';
import { Grid, Stack, Typography, Avatar, Box, Card, CardContent } from '@mui/material';
import { IconArrowUpLeft, IconUsers, IconGenderMale, IconGenderFemale } from '@tabler/icons-react';
import dynamic from "next/dynamic";
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useClientes } from "@/context/clientesContext";

// Dynamic import para ApexCharts (debe ir después de los imports de React)
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const DistribucionClientes = () => {
  const { clientes } = useClientes();
  const theme = useTheme();
  
  // chart colors
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const warning = theme.palette.warning.main;
  const info = theme.palette.info.main;

  // Calcular distribución por sexo
  const calcularDistribucion = () => {
    const masculinos = clientes.filter(cliente => 
      cliente.sexo === 'Masculino' || cliente.sexo === 'M'
    ).length;
    
    const femeninos = clientes.filter(cliente => 
      cliente.sexo === 'Femenino' || cliente.sexo === 'F'
    ).length;
    
    const otros = clientes.filter(cliente => 
      cliente.sexo !== 'Masculino' && cliente.sexo !== 'M' && 
      cliente.sexo !== 'Femenino' && cliente.sexo !== 'F'
    ).length;
    
    return { masculinos, femeninos, otros };
  };

  const distribucion = calcularDistribucion();
  const totalClientes = clientes.length;
  
  const porcentajes = {
    masculinos: totalClientes > 0 ? Math.round((distribucion.masculinos / totalClientes) * 100) : 0,
    femeninos: totalClientes > 0 ? Math.round((distribucion.femeninos / totalClientes) * 100) : 0,
    otros: totalClientes > 0 ? Math.round((distribucion.otros / totalClientes) * 100) : 0
  };

  // chart options
  const optionscolumnchart: any = {
    chart: {
      type: 'donut',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: {
        show: false,
      },
      height: 250,
    },
    colors: [primary, secondary, warning],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          background: 'transparent',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              color: theme.palette.text.primary,
              fontFamily: "'Plus Jakarta Sans', sans-serif;",
            },
            value: {
              show: true,
              fontSize: '20px',
              color: theme.palette.text.primary,
              fontFamily: "'Plus Jakarta Sans', sans-serif;",
              fontWeight: 700,
              formatter: function (val: string) {
                return val + '%';
              }
            },
            total: {
              show: true,
              label: 'Total',
              color: theme.palette.text.secondary,
              fontFamily: "'Plus Jakarta Sans', sans-serif;",
              formatter: function (w: any) {
                return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0) + '%';
              }
            }
          }
        },
      },
    },
    stroke: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: function(val: number) {
          return val + '%';
        }
      }
    },
  };
  
  const seriescolumnchart: any = [
    porcentajes.masculinos,
    porcentajes.femeninos, 
    porcentajes.otros
  ];

  const StatCard = ({ icon, title, value, percentage, color }: any) => (
    <Card 
      sx={{ 
        p: 2, 
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        }
      }}
    >
      <CardContent sx={{ p: '0 !important' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="700">
              {value}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              {title}
            </Typography>
            <Typography variant="caption" color={color} fontWeight="600">
              {percentage}%
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <DashboardCard 
      title={
        <Box display="flex" alignItems="center" gap={1}>
          <IconUsers size={24} />
          <Typography variant="h6" fontWeight="600">
            Distribución por Género
          </Typography>
        </Box>
      }
    >
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 4 }}>
              <StatCard
                icon={<IconGenderMale size={24} />}
                title="Hombres"
                value={distribucion.masculinos}
                percentage={porcentajes.masculinos}
                color={primary}
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <StatCard
                icon={<IconGenderFemale size={24} />}
                title="Mujeres"
                value={distribucion.femeninos}
                percentage={porcentajes.femeninos}
                color={secondary}
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <StatCard
                icon={<IconUsers size={24} />}
                title="Otros"
                value={distribucion.otros}
                percentage={porcentajes.otros}
                color={warning}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Chart */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ position: 'relative', height: 250 }}>
            <Chart
              options={optionscolumnchart}
              series={seriescolumnchart}
              type="donut"
              height={250}
              width={"100%"}
            />
          </Box>
        </Grid>

        {/* Legend */}
        <Grid size={{ xs: 12 }}>
          <Stack direction="row" justifyContent="space-around" spacing={1}>
            <Stack alignItems="center">
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: primary }} />
              <Typography variant="caption" fontWeight="600">Hombres</Typography>
              <Typography variant="caption" color="textSecondary">
                {porcentajes.masculinos}%
              </Typography>
            </Stack>
            <Stack alignItems="center">
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: secondary }} />
              <Typography variant="caption" fontWeight="600">Mujeres</Typography>
              <Typography variant="caption" color="textSecondary">
                {porcentajes.femeninos}%
              </Typography>
            </Stack>
            <Stack alignItems="center">
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: warning }} />
              <Typography variant="caption" fontWeight="600">Otros</Typography>
              <Typography variant="caption" color="textSecondary">
                {porcentajes.otros}%
              </Typography>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </DashboardCard>
  );
};

export default DistribucionClientes;