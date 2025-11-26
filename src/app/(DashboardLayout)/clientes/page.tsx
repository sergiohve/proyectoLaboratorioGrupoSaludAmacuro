'use client'
import { Grid, Box } from '@mui/material';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import ClientesStats from '../components/clientes/ClientesStats';
import AgregarCliente from '../components/clientes/AgregarCliente';
import ClientesTable from '../components/clientes/ClientesTable';


const ClientesPage = () => {
  const router = useRouter();

  useEffect(() => {
    const authStatus = localStorage.getItem('logueado');
    if (authStatus !== 'true') {
      router.push('/authentication/login');
    }
  }, [router]);

  return (
    <PageContainer title="Gestión de Pacientes" description="Administración de clientes del sistema">
      <Box>
        <Grid container spacing={3}>
          {/* Estadísticas */}
          <Grid size={{ xs: 12 }}>
            <ClientesStats />
          </Grid>
          
          {/* Formulario para agregar cliente */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <AgregarCliente />
          </Grid>
          
          {/* Tabla de clientes */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <ClientesTable />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}

export default ClientesPage;