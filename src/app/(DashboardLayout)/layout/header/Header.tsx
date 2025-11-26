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
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={toggleMobileSidebar}
          sx={{
            display: {
              lg: "none",
              xs: "inline",
            },
          }}
        >
          <IconMenu width="20" height="20" />
        </IconButton>

        <Box flexGrow={1} />
        
        <Stack spacing={1} direction="row" alignItems="center">
          {/* Botón para cambiar tema */}
          <IconButton
            color="inherit"
            onClick={toggleTheme}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: "8px",
              padding: "8px",
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
            aria-label="Cambiar tema"
          >
            {mode === 'dark' ? (
              <IconSun size="20" />
            ) : (
              <IconMoon size="20" />
            )}
          </IconButton>

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