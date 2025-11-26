import React from "react";
import Menuitems from "./MenuItems";
import { Box, Typography, useTheme } from "@mui/material";
import {
  Logo,
  Sidebar as MUI_Sidebar,
  Menu,
  MenuItem,
  Submenu,
} from "react-mui-sidebar";
import { IconPoint } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upgrade } from "./Updrade";

const renderMenuItems = (items: any, pathDirect: any, theme: any) => {
  return items.map((item: any) => {
    const Icon = item.icon ? item.icon : IconPoint;

    const itemIcon = <Icon stroke={1.5} size="1.3rem" />;

    if (item.subheader) {
      // Display Subheader
      return (
        <Menu 
          subHeading={item.subheader} 
          key={item.subheader}
          sx={{
            color: theme.palette.text.secondary,
            opacity: 0.7,
          }}
        />
      );
    }

    //If the item has children (submenu)
    if (item.children) {
      return (
        <Submenu
          key={item.id}
          title={item.title}
          icon={itemIcon}
          borderRadius="7px"
          sx={{
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              color: theme.palette.text.primary,
            },
          }}
        >
          {renderMenuItems(item.children, pathDirect, theme)}
        </Submenu>
      );
    }

    // If the item has no children, render a MenuItem
    return (
      <Box px={3} key={item.id}>
        <MenuItem
          key={item.id}
          isSelected={pathDirect === item?.href}
          borderRadius="8px"
          icon={itemIcon}
          link={item.href}
          component={Link}
          sx={{
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              color: theme.palette.text.primary,
            },
            '&.Mui-selected': {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              }
            }
          }}
        >
          {item.title}
        </MenuItem>
      </Box>
    );
  });
};

const SidebarItems = () => {
  const pathname = usePathname();
  const pathDirect = pathname;
  const theme = useTheme();

  return (
    <>
      <MUI_Sidebar
        width={"100%"}
        showProfile={false}
        bgColor={theme.palette.background.paper}
        textColor={theme.palette.text.primary}
        themeColor={theme.palette.primary.main}
        themeSecondaryColor={theme.palette.secondary.main}
        sx={{
          '& .MuiTypography-root': {
            color: theme.palette.text.primary,
          },
          '& .MuiSvgIcon-root': {
            color: theme.palette.text.primary,
          }
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <Link href="/" style={{ display: "flex" }}>
            <img
              src={theme.palette.mode === 'dark' 
                ? "/images/logos/light-logo.png"  // Cambia por tu logo claro si tienes
                : "/images/logos/dark-logo.png"}  // Logo oscuro para tema claro
              alt="Logo"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "contain",
                marginBottom: "-30px",
                filter: 'none'
              }}
            />
          </Link>
        </Box>

        {renderMenuItems(Menuitems, pathDirect, theme)}
      </MUI_Sidebar>
    </>
  );
};

export default SidebarItems;