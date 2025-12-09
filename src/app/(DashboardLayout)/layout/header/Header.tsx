import React, { useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  styled,
  Stack,
  IconButton,
  Badge,
  Button,
  useTheme,
  Typography,
  Chip,
  Tooltip,
} from "@mui/material";
import PropTypes from "prop-types";
import Link from "next/link";
// components
import Profile from "./Profile";
import { IconBellRinging, IconMenu, IconMoon, IconSun, IconWifi, IconWifiOff, IconCloudUpload } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { ThemeContext } from "@/context/ThemeContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
// Cambia esta importación por tu contexto real


interface ItemType {
  toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void;
}

const Header = ({ toggleMobileSidebar }: ItemType) => {
  const router = useRouter();
  const theme = useTheme();

  // Usa tu contexto real
  const { toggleTheme, mode } = React.useContext(ThemeContext) as any;

  // Hook para estado de conexión
  const { isOnline, isSyncing, pendingCount, manualSync } = useOnlineStatus();

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: "none",
    background: theme.palette.background.paper,
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    [theme.breakpoints.up("lg")]: {
      minHeight: "70px",
    },
  }));
  
  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: "100%",
    color: theme.palette.text.secondary,
  }));

  useEffect(() => {
    const authStatus = localStorage.getItem("logueado");
    if (authStatus !== "true") {
      router.push("/authentication/login");
    }
  }, [router]);

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        {/* Modern Menu Button */}
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={toggleMobileSidebar}
          sx={{
            display: {
              lg: "none",
              xs: "inline",
            },
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            border: '2px solid',
            borderColor: 'primary.light',
            borderRadius: 2,
            width: 42,
            height: 42,
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <IconMenu width="20" height="20" />
        </IconButton>

        {/* Connection Status Indicator */}
        <Box sx={{ ml: { xs: 2, lg: 0 } }}>
          <Chip
            icon={isOnline ? <IconWifi size={18} /> : <IconWifiOff size={18} />}
            label={
              isSyncing
                ? 'Sincronizando...'
                : isOnline
                ? 'En línea'
                : `Offline (${pendingCount} pendientes)`
            }
            size="small"
            sx={{
              height: 36,
              fontWeight: 700,
              fontSize: '13px',
              background: isOnline
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              boxShadow: isOnline
                ? '0 2px 8px rgba(16, 185, 129, 0.3)'
                : '0 2px 8px rgba(245, 158, 11, 0.3)',
              border: 'none',
              animation: isSyncing ? 'pulse 2s ease-in-out infinite' : 'none',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.7 },
              },
              '& .MuiChip-icon': {
                color: 'white',
              },
            }}
          />
        </Box>

        <Box flexGrow={1} />

        <Stack spacing={1.5} direction="row" alignItems="center">
          {/* Manual Sync Button (solo visible si hay items pendientes) */}
          {pendingCount > 0 && isOnline && (
            <Tooltip title="Sincronizar ahora" arrow>
              <IconButton
                onClick={() => manualSync()}
                disabled={isSyncing}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(99, 102, 241, 0.4)',
                  },
                  '&:disabled': {
                    background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <IconCloudUpload size="20" />
              </IconButton>
            </Tooltip>
          )}

          {/* Theme Toggle Button */}
          <Tooltip title={mode === 'dark' ? 'Modo claro' : 'Modo oscuro'} arrow>
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              sx={{
                background: mode === 'dark'
                  ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                width: 42,
                height: 42,
                borderRadius: 2,
                boxShadow: mode === 'dark'
                  ? '0 4px 12px rgba(251, 191, 36, 0.3)'
                  : '0 4px 12px rgba(99, 102, 241, 0.3)',
                '&:hover': {
                  background: mode === 'dark'
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  transform: 'rotate(180deg) scale(1.05)',
                  boxShadow: mode === 'dark'
                    ? '0 6px 16px rgba(251, 191, 36, 0.4)'
                    : '0 6px 16px rgba(99, 102, 241, 0.4)',
                },
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              aria-label="Cambiar tema"
            >
              {mode === 'dark' ? (
                <IconSun size="20" />
              ) : (
                <IconMoon size="20" />
              )}
            </IconButton>
          </Tooltip>

          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
};

export default Header;