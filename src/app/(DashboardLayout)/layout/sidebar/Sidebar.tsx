import { Box, Drawer, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import SidebarItems from "./SidebarItems";

interface ItemType {
  isMobileSidebarOpen: boolean;
  onSidebarClose: (event: React.MouseEvent<HTMLElement>) => void;
  isSidebarOpen: boolean;
}

const MSidebar = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
}: ItemType) => {
  const theme = useTheme();
  // This component is loaded with ssr:false → always runs client-side only.
  // localStorage flag set by Electron preload before any page JS runs.
  const isElectron = localStorage.getItem('__electron_app__') === '1';
  const [lgUp, setLgUp] = useState(() =>
    isElectron || window.matchMedia('(min-width: 1200px)').matches
  );

  useEffect(() => {
    if (isElectron) return; // Electron: always desktop, no resize listener needed
    const mq = window.matchMedia('(min-width: 1200px)');
    const handler = (e: MediaQueryListEvent) => setLgUp(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [isElectron]);

  const sidebarWidth = "270px";

  // Custom CSS for scrollbar que se adapta al tema
  const scrollbarStyles = {
    '&::-webkit-scrollbar': {
      width: '7px',
    },
    '&::-webkit-scrollbar-track': {
      background: theme.palette.mode === 'dark' 
        ? theme.palette.background.default 
        : '#f1f1f1',
      borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.mode === 'dark' 
        ? theme.palette.grey[700] 
        : theme.palette.grey[400],
      borderRadius: '10px',
      '&:hover': {
        background: theme.palette.mode === 'dark' 
          ? theme.palette.grey[600] 
          : theme.palette.grey[500],
      },
    },
  };

  // Estilos comunes para el papel del Drawer
  const paperStyles = {
    boxSizing: "border-box",
    ...scrollbarStyles,
    width: sidebarWidth,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderRight: `1px solid ${theme.palette.divider}`,
  };

  if (lgUp) {
    return (
      <Box
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
        }}
      >
        {/* ------------------------------------------- */}
        {/* Sidebar for desktop */}
        {/* ------------------------------------------- */}
        <Drawer
          anchor="left"
          open={isSidebarOpen}
          variant="permanent"
          slotProps={{
            paper: {
              sx: paperStyles,
            }
          }}
        >
          {/* ------------------------------------------- */}
          {/* Sidebar Box */}
          {/* ------------------------------------------- */}
          <Box
            sx={{
              height: "100%",
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Box>
              {/* ------------------------------------------- */}
              {/* Sidebar Items */}
              {/* ------------------------------------------- */}
              <SidebarItems />
            </Box>
          </Box>
        </Drawer>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      variant="temporary"
      slotProps={{
        paper: {
          sx: {
            ...paperStyles,
            boxShadow: theme.palette.mode === 'dark' 
              ? '0px 2px 10px rgba(0, 0, 0, 0.5)' 
              : theme.shadows[8],
          },
        }
      }}
    >
      {/* ------------------------------------------- */}
      {/* Sidebar Box */}
      {/* ------------------------------------------- */}
      <Box sx={{ backgroundColor: theme.palette.background.paper, height: '100%' }}>
        {/* ------------------------------------------- */}
        {/* Sidebar Items */}
        {/* ------------------------------------------- */}
        <SidebarItems />
      </Box>
    </Drawer>
  );
};

export default MSidebar;