import {
  IconLayoutDashboard,
  IconUser,
  IconReportMedical,
  IconChartBar,
  IconDatabase,
  IconHeartbeat,
  IconStethoscope,
  IconMicroscope,
  IconClipboardList,
  IconUsers
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

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
    title: "Lista de pacientes",
    icon: IconUsers, 
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
];

export default Menuitems;