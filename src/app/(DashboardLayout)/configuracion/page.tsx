"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import ConfiguracionFirmantes from "../components/configuracion/ConfiguracionFirmantes";

export default function ConfiguracionPage() {
  const router = useRouter();

  useEffect(() => {
    const authStatus = localStorage.getItem("logueado");
    if (authStatus !== "true") {
      router.push("/authentication/login");
    }
  }, [router]);

  return (
    <PageContainer title="Configuración" description="Configuración de firmantes y sellos del laboratorio">
      <ConfiguracionFirmantes />
    </PageContainer>
  );
}
