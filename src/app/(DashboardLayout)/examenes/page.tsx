'use client'
import { Grid, Box } from '@mui/material';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import RegistroExamen from '../components/examenes/RegistroExamen';
import ListaExamenes from '../components/examenes/ListaExamenes';

const ExamenesPage = () => {
  const router = useRouter();

  useEffect(() => {
    const authStatus = localStorage.getItem('logueado');
    if (authStatus !== 'true') {
      router.push('/authentication/login');
    }
  }, [router]);

  return (
    <PageContainer 
      title="Registro de Exámenes" 
      description="Registro y gestión de exámenes médicos"
    >
      <Box sx={{ p: 0 }}> {/* Eliminar padding del Box contenedor */}
        <Grid container spacing={2}> {/* Reducir el spacing del Grid */}
          {/* Formulario de registro */}
          <Grid size={{ xs: 12, lg: 5 }} sx={{ pt: 0 }}> {/* Eliminar padding top */}
            <RegistroExamen />
          </Grid>
          
          {/* Lista de exámenes */}
          <Grid size={{ xs: 12, lg: 7 }} sx={{ pt: 0 }}> {/* Eliminar padding top */}
            <ListaExamenes />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}

export default ExamenesPage;