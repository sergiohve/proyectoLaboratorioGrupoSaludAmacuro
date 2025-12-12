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
      // Modern Subheader
      return (
        <Menu
          subHeading={item.subheader}
          key={item.subheader}
          sx={{
            color: theme.palette.text.secondary,
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            opacity: 0.7,
            mt: 2,
            mb: 1,
          }}
        />
      );
    }

    //If the item has children (submenu) - Modern Design
    if (item.children) {
      return (
        <Submenu
          key={item.id}
          title={item.title}
          icon={itemIcon}
          borderRadius="12px"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 600,
            mx: 2,
            mb: 0.5,
            "&:hover": {
              background:
                "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)",
              color: theme.palette.primary.main,
              transform: "translateX(4px)",
            },
            transition: "all 0.3s ease",
          }}
        >
          {renderMenuItems(item.children, pathDirect, theme)}
        </Submenu>
      );
    }

    // Modern MenuItem with Gradient and Effects
    const isSelected = pathDirect === item?.href;

    return (
      <Box px={2} key={item.id} mb={0.5}>
        <MenuItem
          key={item.id}
          isSelected={isSelected}
          borderRadius="12px"
          icon={itemIcon}
          link={item.href}
          component={Link}
          sx={{
            color: isSelected ? "white" : theme.palette.text.primary,
            fontWeight: isSelected ? 700 : 600,
            py: 1.5,
            px: 2,
            position: "relative",
            overflow: "hidden",
            background: isSelected
              ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
              : "transparent",
            boxShadow: isSelected
              ? "0 4px 12px rgba(99, 102, 241, 0.3)"
              : "none",
            "&:hover": {
              background: isSelected
                ? "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
                : "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)",
              color: isSelected ? "white" : theme.palette.primary.main,
              transform: "translateX(6px)",
              boxShadow: isSelected
                ? "0 6px 16px rgba(99, 102, 241, 0.4)"
                : "none",
            },
            "&::before": isSelected
              ? {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "4px",
                  background: "white",
                  borderRadius: "0 4px 4px 0",
                }
              : {},
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "& .MuiSvgIcon-root, & svg": {
              color: isSelected ? "white !important" : "inherit",
            },
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
          "& .MuiTypography-root": {
            color: theme.palette.text.primary,
          },
          "& .MuiSvgIcon-root": {
            color: theme.palette.text.primary,
          },
        }}
      >
        {/* Modern Logo Container */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 3,
            px: 2,
            mb: 2,
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: "10%",
              right: "10%",
              height: "2px",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.5) 50%, transparent 100%)",
            },
          }}
        >
          <Link href="/" style={{ display: "flex" }}>
            <Box
              sx={{
                position: "relative",
                p: 2,
                borderRadius: 3,
                background: "#fff",
                border: "2px solid",
                borderColor: "divider",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05) rotate(5deg)",
                  boxShadow: "0 8px 24px rgba(99, 102, 241, 0.2)",
                  borderColor: "primary.main",
                },
              }}
            >
              <img
                src={"/images/logos/back.png"}
                alt="Logo"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "contain",
                  filter: "none",
                }}
              />
            </Box>
          </Link>
        </Box>

        {renderMenuItems(Menuitems, pathDirect, theme)}
      </MUI_Sidebar>
    </>
  );
};

export default SidebarItems;
