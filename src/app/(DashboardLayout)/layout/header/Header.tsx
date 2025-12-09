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
  Tooltip,
} from "@mui/material";
import PropTypes from "prop-types";
import Link from "next/link";
// components
import Profile from "./Profile";
import { IconBellRinging, IconMenu, IconMoon, IconSun } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { ThemeContext } from "@/context/ThemeContext";
// Cambia esta importación por tu contexto real


interface ItemType {
  toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void;
}

const Header = ({ toggleMobileSidebar }: ItemType) => {
  const router = useRouter();
  const theme = useTheme();

  // Usa tu contexto real
  const { toggleTheme, mode } = React.useContext(ThemeContext) as any;

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

        <Box flexGrow={1} />

        <Stack spacing={1.5} direction="row" alignItems="center">
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