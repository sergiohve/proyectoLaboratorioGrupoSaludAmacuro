import React from "react";
import {
  Select,
  MenuItem,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Grid,
} from "@mui/material";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import dynamic from "next/dynamic";
import { useClientes } from "@/context/clientesContext";
import { IconChartBar, IconCalendar } from "@tabler/icons-react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const ClientesOverview = () => {
  const { clientes } = useClientes();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // select
  const [periodo, setPeriodo] = React.useState("semana");

  const handleChange = (event: any) => {
    setPeriodo(event.target.value);
  };

  // chart colors
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const success = theme.palette.success.main;

  // Función para formatear fecha en UTC sin conversión de zona horaria
  const formatUTCDate = (dateString: string, formato: any) => {
    const date = new Date(dateString);
    // Usar métodos UTC para obtener los componentes de la fecha exactos
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const monthShort = date.toLocaleDateString("es-ES", {
      month: "short",
      timeZone: "UTC",
    });

    if (formato.month === "short") {
      return monthShort;
    }

    return `${day}/${month}`;
  };

  // Calcular datos basado en el período seleccionado
  const calcularDatosClientes = () => {
    let dias = 7;
    let formatoFecha = { day: "2-digit", month: "2-digit" } as any;

    switch (periodo) {
      case "mes":
        dias = 30;
        formatoFecha = { day: "2-digit", month: "2-digit" };
        break;
      case "trimestre":
        dias = 90;
        formatoFecha = { month: "short" };
        break;
      default:
        dias = 7;
    }

    // Generar fechas en UTC
    const fechas = Array.from({ length: dias }, (_, i) => {
      const fecha = new Date();
      fecha.setUTCDate(fecha.getUTCDate() - (dias - 1 - i));
      return formatUTCDate(fecha.toISOString(), formatoFecha);
    });

    const registrosPorDia = fechas.map((fecha) => {
      return clientes.filter((cliente) => {
        // Usar la fecha del cliente en UTC sin conversión
        const fechaCliente = formatUTCDate(cliente.fecha, formatoFecha);
        return fechaCliente === fecha;
      }).length;
    });

    // Calcular edad promedio por período
    const promedioEdadPorDia = fechas.map((fecha) => {
      const clientesDelDia = clientes.filter((cliente) => {
        const fechaCliente = formatUTCDate(cliente.fecha, formatoFecha);
        return fechaCliente === fecha;
      });

      return clientesDelDia.length > 0
        ? Math.round(
            clientesDelDia.reduce((sum, cliente) => sum + cliente.edad, 0) /
              clientesDelDia.length
          )
        : 0;
    });

    return {
      categorias: fechas,
      registros: registrosPorDia,
      promedioEdad: promedioEdadPorDia,
    };
  };

  const datos = calcularDatosClientes();
  const totalRegistros = datos.registros.reduce((a, b) => a + b, 0);

  // chart options responsive
  const optionscolumnchart: any = {
    chart: {
      type: "bar",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: {
        show: true,
        tools: {
          download: !isMobile,
          selection: !isMobile,
          zoom: !isMobile,
          zoomin: !isMobile,
          zoomout: !isMobile,
          pan: !isMobile,
          reset: !isMobile,
        },
      },
      height: isMobile ? 300 : 350,
      dropShadow: {
        enabled: !isMobile,
        color: "#000",
        top: 18,
        left: 7,
        blur: 10,
        opacity: 0.2,
      },
    },
    colors: [primary, success],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: isMobile ? "70%" : "55%",
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    legend: {
      show: true,
      position: isMobile ? "bottom" : "top",
      horizontalAlign: isMobile ? "center" : "right",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      fontWeight: 500,
      fontSize: isMobile ? "12px" : "13px",
      labels: {
        colors: theme.palette.text.primary,
      },
      markers: {
        width: 10,
        height: 10,
        radius: 10,
      },
      itemMargin: {
        horizontal: isMobile ? 8 : 12,
        vertical: isMobile ? 4 : 8,
      },
    },
    grid: {
      borderColor: "rgba(0,0,0,0.1)",
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    yaxis: {
      tickAmount: isMobile ? 3 : 4,
      labels: {
        style: {
          color: theme.palette.text.secondary,
          fontFamily: "'Plus Jakarta Sans', sans-serif;",
          fontSize: isMobile ? "11px" : "12px",
        },
      },
    },
    xaxis: {
      categories: datos.categorias,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          color: theme.palette.text.secondary,
          fontFamily: "'Plus Jakarta Sans', sans-serif;",
          fontSize: isMobile ? "10px" : "12px",
        },
        rotate: isMobile ? -45 : 0,
        rotateAlways: isMobile,
        hideOverlappingLabels: true,
        trim: true,
        maxHeight: isMobile ? 60 : 80,
      },
      tickAmount: isMobile ? Math.min(7, datos.categorias.length) : undefined,
    },
    tooltip: {
      theme: theme.palette.mode,
      style: {
        fontSize: isMobile ? "12px" : "14px",
        fontFamily: "'Plus Jakarta Sans', sans-serif;",
      },
      y: {
        formatter: function (val: number) {
          return val.toString();
        },
      },
    },
    responsive: [
      {
        breakpoint: theme.breakpoints.values.sm,
        options: {
          chart: {
            height: 300,
            toolbar: {
              show: false,
            },
          },
          legend: {
            position: "bottom",
            horizontalAlign: "center",
            fontSize: "12px",
          },
          xaxis: {
            labels: {
              rotate: -45,
              style: {
                fontSize: "10px",
              },
            },
          },
        },
      },
      {
        breakpoint: theme.breakpoints.values.md,
        options: {
          chart: {
            height: 320,
          },
        },
      },
    ],
  };

  const seriescolumnchart: any = [
    {
      name: "Nuevos Registros",
      data: datos.registros,
    },
    {
      name: "Edad Prom.",
      data: datos.promedioEdad,
    },
  ];

  return (
    <DashboardCard
      title={
        <Box display="flex" alignItems="center" gap={1}>
          <IconChartBar size={isMobile ? 20 : 24} />
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            fontWeight="600"
            noWrap
          >
            Tendencias de Registro
          </Typography>
        </Box>
      }
      action={
        <Select
          value={periodo}
          size="small"
          onChange={handleChange}
          startAdornment={
            <IconCalendar
              size={isMobile ? 16 : 18}
              style={{ marginRight: "8px" }}
            />
          }
          sx={{
            minWidth: isMobile ? 120 : 140,
            fontSize: isMobile ? "0.875rem" : "1rem",
            "& .MuiSelect-select": {
              display: "flex",
              alignItems: "center",
              gap: 1,
              py: isMobile ? 0.75 : 1,
            },
          }}
        >
          <MenuItem
            value="semana"
            sx={{ fontSize: isMobile ? "0.875rem" : "1rem" }}
          >
            Última Semana
          </MenuItem>
          <MenuItem
            value="mes"
            sx={{ fontSize: isMobile ? "0.875rem" : "1rem" }}
          >
            Último Mes
          </MenuItem>
        </Select>
      }
    >
      <Box sx={{ mb: 3 }}>
        <Box sx={{
          p: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${primary}15 0%, ${success}15 100%)`,
          border: `2px solid ${primary}30`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${primary} 0%, ${success} 100%)`,
          }
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid>
              <Typography
                variant="caption"
                fontWeight="600"
                color="text.secondary"
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                  mb: 1,
                  display: 'block'
                }}
              >
                Total del Período
              </Typography>
              <Typography
                variant={isMobile ? "h3" : "h2"}
                fontWeight="800"
                sx={{
                  background: `linear-gradient(135deg, ${primary} 0%, ${success} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}
              >
                {totalRegistros}
              </Typography>
              <Typography
                variant={isMobile ? "body2" : "body1"}
                color="text.secondary"
                fontWeight={500}
                sx={{ fontSize: isMobile ? "0.75rem" : "0.875rem" }}
              >
                Nuevos registros de pacientes
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: "100%",
          overflow: "hidden",
          p: 2,
          borderRadius: 3,
          background: theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.02)'
            : 'rgba(0,0,0,0.01)',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Chart
          options={optionscolumnchart}
          series={seriescolumnchart}
          type="bar"
          height={optionscolumnchart.chart.height}
          width={"100%"}
        />
      </Box>
    </DashboardCard>
  );
};

export default ClientesOverview;
