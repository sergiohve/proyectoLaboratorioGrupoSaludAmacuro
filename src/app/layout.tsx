"use client";
import { baselightTheme } from "@/utils/theme/DefaultColors";
import { basedarkTheme } from "@/utils/theme/DefaultColors"; // Asegúrate de tener este tema oscuro
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, createContext, useContext } from "react";
import "./global.css";
import { ClientesProvider } from "@/context/clientesContext";

// Crear el contexto del tema
type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a CustomThemeProvider');
  }
  return context;
};

// Proveedor de tema personalizado
const CustomThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    // Recuperar el tema guardado del localStorage
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme) {
      setMode(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme', newMode);
  };

  const theme = mode === 'light' ? baselightTheme : basedarkTheme;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("logueado");
      const authenticated = authStatus === "true";
      setIsAuthenticated(authenticated);

      if (authenticated) {
        if (
          pathname === "/authentication/login" ||
          pathname === "/"
        ) {
          router.push("/");
        }
      } else {
        if (pathname === "/") {
          router.push("/authentication/login");
        }
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (isAuthenticated === null) {
    return (
      <html lang="es">
        <body>
          <ThemeProvider theme={baselightTheme}>
            <CssBaseline />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                fontSize: "18px",
              }}
            >
              Verificando autenticación...
            </div>
          </ThemeProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="es">
      <body>
        <CustomThemeProvider> {/* Cambia aquí */}
          <ClientesProvider>
            {children}
          </ClientesProvider>
        </CustomThemeProvider>
      </body>
    </html>
  );
}