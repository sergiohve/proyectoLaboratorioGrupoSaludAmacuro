"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import {
  IconDownload,
  IconDeviceDesktop,
  IconDatabase,
  IconShieldCheck,
  IconCheck,
  IconBrandWindows,
  IconPackage,
  IconAlertCircle,
  IconFolderOpen,
  IconPlayerPlay,
  IconCircleCheck,
  IconInfoCircle,
} from "@tabler/icons-react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

// ── Feature cards data ────────────────────────────────────────────────────
const features = [
  {
    icon: <IconDeviceDesktop size={32} />,
    title: "Aplicación de escritorio",
    desc: "Funciona sin navegador. Acceso directo desde el escritorio o barra de tareas.",
    color: "#1976d2",
  },
  {
    icon: <IconDatabase size={32} />,
    title: "Base de datos local",
    desc: "Todos los datos se guardan en su equipo. No requiere internet para operar.",
    color: "#388e3c",
  },
  {
    icon: <IconShieldCheck size={32} />,
    title: "Privacidad total",
    desc: "La información de pacientes y exámenes nunca sale de su computadora.",
    color: "#7b1fa2",
  },
  {
    icon: <IconPackage size={32} />,
    title: "Todo incluido",
    desc: "El instalador incluye el servidor, la base de datos y la interfaz. Un solo archivo.",
    color: "#e65100",
  },
];

// ── Steps ─────────────────────────────────────────────────────────────────
const steps = [
  {
    label: "Descargar el instalador",
    icon: <IconDownload size={20} />,
    content: (
      <>
        <Typography variant="body2" color="text.secondary" mb={1}>
          Haga clic en el botón <strong>Descargar instalador</strong> en la parte superior de esta página.
          El archivo se llama <code>Sistema Laboratorio Setup.exe</code> y pesa aproximadamente <strong>300–400 MB</strong>.
        </Typography>
        <Alert severity="info" sx={{ mt: 1, fontSize: 13 }}>
          Si Windows Defender muestra una advertencia, haga clic en <strong>"Más información"</strong> → <strong>"Ejecutar de todas formas"</strong>. El archivo es seguro.
        </Alert>
      </>
    ),
  },
  {
    label: "Ejecutar el instalador",
    icon: <IconPlayerPlay size={20} />,
    content: (
      <Typography variant="body2" color="text.secondary">
        Doble clic sobre el archivo descargado. Seleccione la carpeta de instalación (o deje la que viene por defecto)
        y haga clic en <strong>Instalar</strong>. El proceso tarda menos de un minuto.
      </Typography>
    ),
  },
  {
    label: "Abrir la aplicación",
    icon: <IconFolderOpen size={20} />,
    content: (
      <Typography variant="body2" color="text.secondary">
        Al finalizar, aparecerá un acceso directo en el escritorio llamado <strong>Sistema Laboratorio</strong>.
        Haga doble clic para abrirlo. La primera vez tarda unos segundos mientras inicia la base de datos.
      </Typography>
    ),
  },
  {
    label: "Listo para usar",
    icon: <IconCircleCheck size={20} />,
    content: (
      <Typography variant="body2" color="text.secondary">
        La aplicación abrirá una ventana con la interfaz completa del sistema. Los datos que registre
        se guardan automáticamente en su equipo en <code>%APPDATA%\SistemaLaboratorio\</code>.
      </Typography>
    ),
  },
];

// ── Requirements ─────────────────────────────────────────────────────────
const requirements = [
  "Windows 10 o Windows 11 (64 bits)",
  "4 GB de RAM mínimo (8 GB recomendado)",
  "500 MB de espacio libre en disco (más espacio para los datos)",
  "Resolución de pantalla 1280×720 o superior",
];

// ── Component ─────────────────────────────────────────────────────────────
const InstaladorPage = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "https://github.com/sergiohve/proyectoLaboratorioGrupoSaludAmacuro/releases/download/v2.0.0/Sistema.Laboratorio.Setup.1.0.0.exe";
    link.download = "Sistema Laboratorio Setup.exe";
    link.click();
  };

  return (
    <PageContainer
      title="Instalador de escritorio"
      description="Descarga e instala el sistema como aplicación de escritorio"
    >
      <Box>
        {/* ── Hero ── */}
        <Box
          sx={{
            borderRadius: 4,
            background: `linear-gradient(135deg, #1565c0 0%, #0d47a1 60%, #1a237e 100%)`,
            color: "white",
            p: { xs: 3, md: 5 },
            mb: 4,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: -60,
              right: -60,
              width: 240,
              height: 240,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
            },
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -40,
              left: "30%",
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
            },
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Box
                  sx={{
                    bgcolor: "rgba(255,255,255,0.15)",
                    borderRadius: 2,
                    p: 1.5,
                    display: "flex",
                  }}
                >
                  <IconDeviceDesktop size={36} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={800} lineHeight={1.2}>
                    Sistema Laboratorio
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
                    Versión de escritorio — sin internet
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body1" sx={{ opacity: 0.9, mb: 3, maxWidth: 520 }}>
                Instale el sistema completo en su computadora. Gestione pacientes, exámenes
                y resultados sin depender de internet ni de servidores externos.
              </Typography>

              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<IconDownload size={22} />}
                  onClick={handleDownload}
                  sx={{
                    bgcolor: "white",
                    color: "#1565c0",
                    fontWeight: 700,
                    fontSize: "1rem",
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    "&:hover": {
                      bgcolor: "#e3f2fd",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 28px rgba(0,0,0,0.25)",
                    },
                    transition: "all 0.25s ease",
                  }}
                >
                  Descargar instalador
                </Button>

                <Chip
                  icon={<IconBrandWindows size={16} />}
                  label="Windows 10 / 11 · 64 bits"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.15)",
                    color: "white",
                    fontWeight: 600,
                    border: "1px solid rgba(255,255,255,0.3)",
                    "& .MuiChip-icon": { color: "white" },
                  }}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }} sx={{ display: { xs: "none", md: "flex" }, justifyContent: "center" }}>
              <Box sx={{ fontSize: 120, opacity: 0.25, lineHeight: 1 }}>🧪</Box>
            </Grid>
          </Grid>
        </Box>

        {/* ── Features ── */}
        <Grid container spacing={3} mb={4}>
          {features.map((f) => (
            <Grid key={f.title} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  border: `1px solid ${f.color}22`,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: `0 8px 24px ${f.color}22` },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "inline-flex",
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: `${f.color}15`,
                      color: f.color,
                      mb: 2,
                    }}
                  >
                    {f.icon}
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {f.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* ── Steps + Requirements ── */}
        <Grid container spacing={3}>
          {/* Steps */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ borderRadius: 3, height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                  <IconPlayerPlay size={22} color={theme.palette.primary.main} />
                  <Typography variant="h6" fontWeight={700}>
                    Cómo instalar
                  </Typography>
                </Box>

                <Stepper activeStep={activeStep} orientation="vertical">
                  {steps.map((step, index) => (
                    <Step key={step.label} expanded>
                      <StepLabel
                        onClick={() => setActiveStep(index)}
                        sx={{ cursor: "pointer" }}
                        StepIconComponent={() => (
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              bgcolor: index <= activeStep ? "primary.main" : "grey.200",
                              color: index <= activeStep ? "white" : "text.secondary",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {index < activeStep ? <IconCheck size={16} /> : step.icon}
                          </Box>
                        )}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          color={index <= activeStep ? "text.primary" : "text.secondary"}
                        >
                          {step.label}
                        </Typography>
                      </StepLabel>
                      <StepContent>
                        <Box sx={{ pb: 2, pt: 0.5 }}>
                          {step.content}
                          {index < steps.length - 1 && (
                            <Button
                              variant="outlined"
                              size="small"
                              sx={{ mt: 1.5, textTransform: "none", borderRadius: 2 }}
                              onClick={() => setActiveStep(index + 1)}
                            >
                              Siguiente
                            </Button>
                          )}
                        </Box>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Card>
          </Grid>

          {/* Requirements + Notes */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box display="flex" flexDirection="column" gap={3}>
              {/* Requirements */}
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <IconBrandWindows size={22} color="#0078d4" />
                    <Typography variant="h6" fontWeight={700}>
                      Requisitos del sistema
                    </Typography>
                  </Box>
                  <List dense disablePadding>
                    {requirements.map((req) => (
                      <ListItem key={req} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <IconCheck size={16} color={theme.palette.success.main} />
                        </ListItemIcon>
                        <ListItemText
                          primary={req}
                          primaryTypographyProps={{ variant: "body2" }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>

              {/* Data location */}
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <IconDatabase size={22} color={theme.palette.success.main} />
                    <Typography variant="h6" fontWeight={700}>
                      Dónde se guardan los datos
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Todos los datos se almacenan localmente en:
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: "grey.100",
                      borderRadius: 2,
                      p: 1.5,
                      fontFamily: "monospace",
                      fontSize: 12,
                      wordBreak: "break-all",
                      mb: 1.5,
                    }}
                  >
                    %APPDATA%\SistemaLaboratorio\db\
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Al desinstalar la aplicación <strong>los datos no se eliminan</strong>,
                    así puede reinstalar sin perder información.
                  </Typography>
                </CardContent>
              </Card>

              {/* Note */}
              <Alert
                severity="warning"
                icon={<IconAlertCircle size={20} />}
                sx={{ borderRadius: 3 }}
              >
                <Typography variant="body2" fontWeight={600} mb={0.5}>
                  Importante — Windows SmartScreen
                </Typography>
                <Typography variant="body2">
                  Windows puede mostrar una advertencia al ejecutar el instalador.
                  Haga clic en <strong>"Más información"</strong> y luego en{" "}
                  <strong>"Ejecutar de todas formas"</strong> para continuar.
                </Typography>
              </Alert>
            </Box>
          </Grid>
        </Grid>

        {/* ── Footer note ── */}
        <Box
          mt={4}
          p={3}
          sx={{
            borderRadius: 3,
            bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <IconInfoCircle size={22} color={theme.palette.info.main} />
          <Typography variant="body2" color="text.secondary">
            Esta versión de escritorio incluye <strong>MongoDB 6.0</strong>,{" "}
            <strong>Node.js</strong> y el servidor Express integrados. No necesita instalar
            ningún componente adicional. El instalador fue generado con{" "}
            <strong>Electron</strong> y <strong>electron-builder</strong>.
          </Typography>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default InstaladorPage;
