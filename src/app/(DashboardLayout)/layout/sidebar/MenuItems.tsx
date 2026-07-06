import {
  IconLayoutDashboard,
  IconReportMedical,
  IconClipboardList,
  IconUsers,
  IconDownload,
  IconCurrencyDollar,
  IconSettings,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const isElectron = () =>
  typeof window !== "undefined" && window.location.port === "4000";

const Menuitems = [
  {
    navlabel: true,
    subheader: "Gráficos",
  },
  {
    id: uniqueId(),
    title: "Home",
    icon: IconLayoutDashboard,
    href: "/",
  },
  {
    navlabel: true,
    subheader: "Pacientes",
  },
  {
    id: uniqueId(),
    title: "Registro pacientes",
    icon: IconUsers,
    href: "/clientes",
  },
  {
    id: uniqueId(),
    title: "Lista de Pacientes",
    icon: IconClipboardList,
    href: "/lista-clientes",
  },
  {
    navlabel: true,
    subheader: "Exámenes",
  },
  {
    id: uniqueId(),
    title: "Crear examén",
    icon: IconReportMedical,
    href: "/examenes",
  },
  {
    id: uniqueId(),
    title: "Lista de examenes",
    icon: IconClipboardList,
    href: "/lista-examenes",
  },
  {
    id: uniqueId(),
    title: "Precios de exámenes",
    icon: IconCurrencyDollar,
    href: "/precios-examenes",
  },
  ...(isElectron() ? [
    {
      navlabel: true,
      subheader: "Configuración",
    },
    {
      id: uniqueId(),
      title: "Firmantes y Sellos",
      icon: IconSettings,
      href: "/configuracion",
    },
  ] : []),
  {
    navlabel: true,
    subheader: "Aplicación",
  },
  {
    id: uniqueId(),
    title: "Descargar instalador",
    icon: IconDownload,
    href: "/instalador",
  },
];

export default Menuitems;