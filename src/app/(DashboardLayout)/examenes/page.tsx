"use client";
import { Grid, Box } from "@mui/material";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import RegistroExamen from "../components/examenes/RegistroExamen";
import ListaExamenes from "../components/examenes/ListaExamenes";

const ExamenesPage = () => {
  const router = useRouter();

  useEffect(() => {
    const authStatus = localStorage.getItem("logueado");
    if (authStatus !== "true") {
      router.push("/authentication/login");
    }
  }, [router]);

  return (
    <PageContainer
      title="Registro de Exámenes"
      description="Registro y gestión de exámenes médicos"
    >
      <Box sx={{ p: 0 }}>
        <Grid size={{ xs: 12, lg: 12 }} sx={{ pt: 0 }}>
          <RegistroExamen />
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default ExamenesPage;
