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

  // Modern gradient colors
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
        p: 0,
        background: `linear-gradient(135deg, ${color}08 0%, ${color}20 100%)`,
        border: `2px solid ${color}30`,
        borderRadius: 3,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: `0 12px 40px -10px ${color}40`,
          border: `2px solid ${color}60`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2.5}>
          <Box
            sx={{
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: -8,
                background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
                borderRadius: '50%',
                animation: 'pulse 2s ease-in-out infinite',
              },
              '@keyframes pulse': {
                '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
                '50%': { opacity: 1, transform: 'scale(1.1)' },
              }
            }}
          >
            <Avatar
              sx={{
                bgcolor: color,
                background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
                width: 60,
                height: 60,
                boxShadow: `0 8px 16px ${color}40`,
              }}
            >
              {icon}
            </Avatar>
          </Box>
          <Box flex={1}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={500} sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight="800" sx={{
              background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5
            }}>
              {value}
            </Typography>
            <Box sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              bgcolor: `${color}15`,
            }}>
              <Typography variant="body2" color={color} fontWeight="700">
                {percentage}%
              </Typography>
            </Box>
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

        {/* Modern Legend */}
        <Grid size={{ xs: 12 }}>
          <Stack direction="row" justifyContent="space-around" spacing={2}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1.5,
              borderRadius: 2,
              bgcolor: `${primary}10`,
              border: `1px solid ${primary}30`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${primary}20`,
              }
            }}>
              <Box sx={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${primary} 0%, ${primary}CC 100%)`,
                boxShadow: `0 2px 8px ${primary}40`,
              }} />
              <Box>
                <Typography variant="caption" fontWeight="700" display="block">Hombres</Typography>
                <Typography variant="caption" color={primary} fontWeight="800">
                  {porcentajes.masculinos}%
                </Typography>
              </Box>
            </Box>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1.5,
              borderRadius: 2,
              bgcolor: `${secondary}10`,
              border: `1px solid ${secondary}30`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${secondary}20`,
              }
            }}>
              <Box sx={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${secondary} 0%, ${secondary}CC 100%)`,
                boxShadow: `0 2px 8px ${secondary}40`,
              }} />
              <Box>
                <Typography variant="caption" fontWeight="700" display="block">Mujeres</Typography>
                <Typography variant="caption" color={secondary} fontWeight="800">
                  {porcentajes.femeninos}%
                </Typography>
              </Box>
            </Box>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1.5,
              borderRadius: 2,
              bgcolor: `${warning}10`,
              border: `1px solid ${warning}30`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${warning}20`,
              }
            }}>
              <Box sx={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${warning} 0%, ${warning}CC 100%)`,
                boxShadow: `0 2px 8px ${warning}40`,
              }} />
              <Box>
                <Typography variant="caption" fontWeight="700" display="block">Otros</Typography>
                <Typography variant="caption" color={warning} fontWeight="800">
                  {porcentajes.otros}%
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </DashboardCard>
  );
};

export default DistribucionClientes;