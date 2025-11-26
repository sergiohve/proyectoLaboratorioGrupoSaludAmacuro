import React from 'react';
import { Select, MenuItem, Box, Typography, useTheme } from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import dynamic from "next/dynamic";
import { useClientes } from '@/context/clientesContext';
import { IconChartBar, IconCalendar } from '@tabler/icons-react';

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const ClientesOverview = () => {
    const { clientes } = useClientes();
    const theme = useTheme();
    
    // select
    const [periodo, setPeriodo] = React.useState('semana');

    const handleChange = (event: any) => {
        setPeriodo(event.target.value);
    };

    // chart colors
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;
    const success = theme.palette.success.main;

    // Calcular datos basado en el período seleccionado
    const calcularDatosClientes = () => {
        let dias = 7;
        let formatoFecha = { day: '2-digit', month: '2-digit' } as any;
        
        switch(periodo) {
            case 'mes':
                dias = 30;
                formatoFecha = { day: '2-digit', month: '2-digit' };
                break;
            case 'trimestre':
                dias = 90;
                formatoFecha = { month: 'short' };
                break;
            default:
                dias = 7;
        }

        const fechas = Array.from({ length: dias }, (_, i) => {
            const fecha = new Date();
            fecha.setDate(fecha.getDate() - (dias - 1 - i));
            return fecha.toLocaleDateString('es-ES', formatoFecha as any);
        });

        const registrosPorDia = fechas.map(fecha => {
            return clientes.filter(cliente => {
                const fechaCliente = new Date(cliente.fecha).toLocaleDateString('es-ES', formatoFecha as any);
                return fechaCliente === fecha;
            }).length;
        });

        // Calcular edad promedio por período
        const promedioEdadPorDia = fechas.map(fecha => {
            const clientesDelDia = clientes.filter(cliente => {
                const fechaCliente = new Date(cliente.fecha).toLocaleDateString('es-ES', formatoFecha as any);
                return fechaCliente === fecha;
            });
            
            return clientesDelDia.length > 0 
                ? Math.round(clientesDelDia.reduce((sum, cliente) => sum + cliente.edad, 0) / clientesDelDia.length)
                : 0;
        });

        return {
            categorias: fechas,
            registros: registrosPorDia,
            promedioEdad: promedioEdadPorDia
        };
    };

    const datos = calcularDatosClientes();
    const totalRegistros = datos.registros.reduce((a, b) => a + b, 0);

    // chart options
    const optionscolumnchart: any = {
        chart: {
            type: 'bar',
            fontFamily: "'Plus Jakarta Sans', sans-serif;",
            foreColor: '#adb0bb',
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true
                }
            },
            height: 350,
            dropShadow: {
                enabled: true,
                color: '#000',
                top: 18,
                left: 7,
                blur: 10,
                opacity: 0.2
            },
        },
        colors: [primary, success],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                borderRadius: 6,
                borderRadiusApplication: 'end',
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent'],
        },
        legend: {
            show: true,
            position: 'top',
            horizontalAlign: 'right',
            fontFamily: "'Plus Jakarta Sans', sans-serif;",
            fontWeight: 500,
            fontSize: '13px',
            labels: {
                colors: theme.palette.text.primary,
            },
            markers: {
                width: 12,
                height: 12,
                radius: 12,
            },
        },
        grid: {
            borderColor: 'rgba(0,0,0,0.1)',
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
            tickAmount: 4,
            labels: {
                style: {
                    colors: theme.palette.text.secondary,
                    fontFamily: "'Plus Jakarta Sans', sans-serif;",
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
                    colors: theme.palette.text.secondary,
                    fontFamily: "'Plus Jakarta Sans', sans-serif;",
                },
            },
        },
        tooltip: {
            theme: theme.palette.mode,
            y: {
                formatter: function (val: number) {
                    return val + (val === 1 ? "" : "");
                }
            }
        },
        responsive: [
            {
                breakpoint: 480,
                options: {
                    chart: {
                        height: 300,
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        ]
    };
    
    const seriescolumnchart: any = [
        {
            name: 'Nuevos Registros',
            data: datos.registros,
        },
        {
            name: 'Edad Prom.',
            data: datos.promedioEdad,
        },
    ];

    return (
        <DashboardCard 
            title={
                <Box display="flex" alignItems="center" gap={1}>
                    <IconChartBar size={24} />
                    <Typography variant="h6" fontWeight="600">
                        Tendencias de Registro
                    </Typography>
                </Box>
            }
            action={
                <Select
                    value={periodo}
                    size="small"
                    onChange={handleChange}
                    startAdornment={<IconCalendar size={18} style={{ marginRight: '8px' }} />}
                    sx={{
                        minWidth: 140,
                        '& .MuiSelect-select': {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }
                    }}
                >
                    <MenuItem value="semana">Última Semana</MenuItem>
                    <MenuItem value="mes">Último Mes</MenuItem>
                    <MenuItem value="trimestre">Último Trimestre</MenuItem>
                </Select>
            }
        >
            <Box sx={{ mb: 2 }}>
                <Typography variant="h4" fontWeight="700" color="primary">
                    {totalRegistros}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                    Registros en el período seleccionado
                </Typography>
            </Box>

            <Chart
                options={optionscolumnchart}
                series={seriescolumnchart}
                type="bar"
                height={350}
                width={"100%"}
            />
        </DashboardCard>
    );
};

export default ClientesOverview;