import { createTheme } from "@mui/material/styles";

export const baselightTheme = createTheme({
  direction: "ltr",
  palette: {
    mode: "light",
    primary: {
      main: "#5D87FF",
      light: "#ECF2FF",
      dark: "#4570EA",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#49BEFF",
      light: "#E8F7FF",
      dark: "#23afdb",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#13DEB9",
      light: "#E6FFFA",
      dark: "#02b3a9",
      contrastText: "#FFFFFF",
    },
    info: {
      main: "#539BFF",
      light: "#EBF3FE",
      dark: "#1682d4",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#FA896B",
      light: "#FDEDE8",
      dark: "#f3704d",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#FFAE1F",
      light: "#FEF5E5",
      dark: "#ae8e59",
      contrastText: "#2A3547",
    },
    grey: {
      50: "#F8FAFC",
      100: "#F2F6FA",
      200: "#EAEFF4",
      300: "#DFE5EF",
      400: "#7C8FAC",
      500: "#5A6A85",
      600: "#2A3547",
      700: "#1E2A3A",
      800: "#152032",
      900: "#0F172A",
    },
    text: {
      primary: "#2A3547",
      secondary: "#5A6A85",
      disabled: "#7C8FAC",
    },
    action: {
      active: "#5D87FF",
      hover: "#F2F6FA",
      selected: "#ECF2FF",
      disabled: "#DFE5EF",
      disabledBackground: "rgba(93, 135, 255, 0.12)",
      hoverOpacity: 0.08,
      focus: "#ECF2FF",
    },
    divider: "#EAEFF4",
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
    },
    common: {
      black: "#000000",
      white: "#FFFFFF",
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export const basedarkTheme = createTheme({
  direction: "ltr",
  palette: {
    mode: "dark",
    primary: {
      main: "#5D87FF",
      light: "#1E3A8A",
      dark: "#3B82F6",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#49BEFF",
      light: "#0C4A6E",
      dark: "#0EA5E9",
      contrastText: "#0F172A",
    },
    success: {
      main: "#13DEB9",
      light: "#064E3B",
      dark: "#10B981",
      contrastText: "#0F172A",
    },
    info: {
      main: "#539BFF",
      light: "#1E3A8A",
      dark: "#3B82F6",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#FA896B",
      light: "#7C2D12",
      dark: "#EF4444",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#FFAE1F",
      light: "#78350F",
      dark: "#F59E0B",
      contrastText: "#0F172A",
    },
    grey: {
      50: "#0F172A",
      100: "#1E293B",
      200: "#2A3547",
      300: "#3C4557",
      400: "#5A6A85",
      500: "#8A9BBA",
      600: "#CBD5E1",
      700: "#E2E8F0",
      800: "#F1F5F9",
      900: "#F8FAFC",
    },
    text: {
      primary: "#F8FAFC",
      secondary: "#CBD5E1",
      disabled: "#64748B",
    },
    action: {
      active: "#5D87FF",
      hover: "#2A3547",
      selected: "#1E3A8A",
      disabled: "#3C4557",
      disabledBackground: "rgba(93, 135, 255, 0.12)",
      hoverOpacity: 0.08,
      focus: "#1E3A8A",
    },
    divider: "#2A3547",
    background: {
      default: "#0F172A",
      paper: "#1E293B",
    },
    common: {
      black: "#000000",
      white: "#FFFFFF",
    },
  },
  shape: {
    borderRadius: 8,
  },
});