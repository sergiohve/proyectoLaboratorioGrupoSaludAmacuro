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
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/",
  },
  {
    navlabel: true,
    subheader: "Datos",
  },
  {
    id: uniqueId(),
    title: "Pacientes",
    icon: IconUsers, // o IconUser para un solo usuario
    href: "/clientes",
  },
  {
    id: uniqueId(),
    title: "Reportes de exámenes",
    icon: IconReportMedical, // o IconClipboardList
    href: "/examenes",
  },
];

export default Menuitems;