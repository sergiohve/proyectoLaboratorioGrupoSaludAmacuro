"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import PreciosExamenes from "../components/examenes/PreciosExamenes";
import { PreciosExamenesProvider } from "@/context/preciosExamenesContext";

export default function PreciosExamenesPage() {
  const router = useRouter();

  useEffect(() => {
    const authStatus = localStorage.getItem("logueado");
    if (authStatus !== "true") {
      router.push("/authentication/login");
    }
  }, [router]);

  return (
    <PageContainer title="Precios de Exámenes" description="Tarifario de pruebas de laboratorio">
      <PreciosExamenesProvider>
        <PreciosExamenes />
      </PreciosExamenesProvider>
    </PageContainer>
  );
}
