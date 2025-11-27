"use client";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { People, PersonAdd, Badge, CalendarToday } from "@mui/icons-material";
import { useClientes } from "@/context/clientesContext";

const ClientesStats = () => {
  const { stats } = useClientes();
console.log(stats)

  const statsData = [
    {
      title: "Total Pacientes",
      value: stats.totalClientes.toString(),
      icon: <People sx={{ fontSize: 40, color: "primary.main" }} />,
      color: "primary" as const,
    },
    {
      title: "Registros Mes",
      value: stats.registrosMes.toString(),
      icon: <CalendarToday sx={{ fontSize: 40, color: "warning.main" }} />,
      color: "warning" as const,
    },
  ];

  return (
    <Grid container spacing={3}>
      {statsData.map((stat, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, lg: 6 }}>
          <Card
            sx={{
              position: "relative",
              overflow: "visible",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 4,
              },
            }}
          >
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    color="textSecondary"
                    variant="h6"
                    fontWeight={400}
                    fontSize={14}
                  >
                    {stat.title}
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    mt={1}
                    color={`${stat.color}.main`}
                  >
                    {stat.value}
                  </Typography>
                </Box>
                <Box>{stat.icon}</Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ClientesStats;