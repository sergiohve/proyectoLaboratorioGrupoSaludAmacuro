"use client";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import { People, CalendarToday } from "@mui/icons-material";
import { useClientes } from "@/context/clientesContext";
import { memo, useMemo } from "react";

const cardStyles = {
  base: {
    position: "relative",
    overflow: "hidden",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    border: 'none',
    boxShadow: `0 8px 32px -8px rgba(0,0,0,0.3)`,
  },
  hover: {
    transform: "translateY(-8px) scale(1.02)",
    boxShadow: `0 16px 48px -8px rgba(0,0,0,0.4)`,
  },
  beforeOverlay: {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at top right, rgba(222, 28, 28, 0.2) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  afterCircle: {
    content: '""',
    position: 'absolute',
    bottom: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    pointerEvents: 'none',
  },
} as const;

const iconBoxStyles = {
  wrapper: {
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: -10,
      background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
      borderRadius: '50%',
    }
  },
  inner: {
    bgcolor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    p: 2,
    display: 'flex',
    backdropFilter: 'blur(10px)',
  }
} as const;

const ClientesStats = memo(() => {
  const { stats } = useClientes();

  const statsData = useMemo(() => [
    {
      title: "Total Pacientes",
      value: stats.totalClientes,
      icon: <People sx={{ fontSize: 40, color: "primary.main" }} />,
      color: "primary" as const,
    },
    {
      title: "Registros Mes",
      value: stats.registrosMes,
      icon: <CalendarToday sx={{ fontSize: 40, color: "warning.main" }} />,
      color: "warning" as const,
    },
  ], [stats.totalClientes, stats.registrosMes]);

  return (
    <Grid container spacing={3}>
      {statsData.map((stat, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, lg: 6 }}>
          <Card
            sx={{
              ...cardStyles.base,
              background: `linear-gradient(135deg, ${stat.color}.main 0%, ${stat.color}.dark 100%)`,
              "&:hover": cardStyles.hover,
              "&::before": cardStyles.beforeOverlay,
              "&::after": cardStyles.afterCircle,
            }}
          >
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box flex={1}>
                  <Typography
                    color="rgba(35, 25, 25, 0.9)"
                    variant="h6"
                    fontWeight={600}
                    fontSize={14}
                    sx={{
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      mb: 1.5
                    }}
                  >
                    {stat.title}
                  </Typography>
                  <Typography
                    variant="h2"
                    fontWeight={900}
                    sx={{
                      color: '#fa0707ff',
                      textShadow: '0 2px 10px rgba(13, 4, 4, 0.2)',
                      letterSpacing: -1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                </Box>
                <Box sx={iconBoxStyles.wrapper}>
                  <Box sx={iconBoxStyles.inner}>
                    {stat.icon}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
});

ClientesStats.displayName = 'ClientesStats';

export default ClientesStats;