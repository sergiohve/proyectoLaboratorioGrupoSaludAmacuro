'use client'
import { Grid, Box } from '@mui/material';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import ClientesOverview from './components/dashboard/ClientesOverview';
import DistribucionClientes from './components/dashboard/DistribucionClientes';
import RegistrosRecientes from './components/dashboard/RegistrosRecientes';

const Dashboard = () => {
  const router = useRouter();

  useEffect(() => {
    const authStatus = localStorage.getItem('logueado');
    if (authStatus !== 'true') {
      router.push('/authentication/login');
    }
  }, [router]);

  return (
    <PageContainer title="Dashboard" description="Dashboard de Gestión de Clientes">
      <Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 12 }}>
            <ClientesOverview />
          </Grid>
          <Grid size={{ xs: 12, lg: 12 }}>
            <Grid container spacing={3}>
              <Grid size={6}>
                <DistribucionClientes />
              </Grid>
              <Grid size={6}>
                <RegistrosRecientes />
              </Grid>
            </Grid>
          </Grid>
          
        </Grid>
      </Box>
    </PageContainer>
  );
}

export default Dashboard;