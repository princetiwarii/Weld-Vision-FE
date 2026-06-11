import { Fragment } from "react";
import { NavLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import ButtonBase from "@mui/material/ButtonBase";
import styled from "@mui/material/styles/styled";

import useSettings from "app/hooks/useSettings";
import { Paragraph, Span } from "../Typography";
import MatxVerticalNavExpansionPanel from "./MatxVerticalNavExpansionPanel";

const ListLabel = styled(Paragraph)(({ theme, mode }) => ({
  fontSize: "11px",
  marginTop: "24px",
  marginLeft: "20px",
  marginBottom: "10px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  display: mode === "compact" ? "none" : "block",
  color: "rgba(255,255,255,0.45)"
}));

const ExtAndIntCommon = {
  display: "flex",
  overflow: "hidden",
  borderRadius: "8px",
  height: 48,
  whiteSpace: "pre",
  marginBottom: "4px",
  textDecoration: "none",
  justifyContent: "space-between",
  transition: "all 150ms ease-in",
  "&:hover": { background: "rgba(255, 255, 255, 0.10)" },
  "&.compactNavItem": {
    overflow: "hidden",
    justifyContent: "center !important"
  },
  "& .icon": {
    fontSize: "20px",
    paddingLeft: "20px",
    paddingRight: "20px",
    verticalAlign: "middle"
  }
};

const ExternalLink = styled("a")(({ theme }) => ({
  ...ExtAndIntCommon,
  color: theme.palette.text.primary
}));

const InternalLink = styled(Box)(({ theme }) => ({
  "& a": {
    ...ExtAndIntCommon,
    color: theme.palette.text.primary
  },
  "& .navItemActive": {
    backgroundColor: "rgba(255, 255, 255, 0.16)"
  }
}));

const StyledText = styled(Span)(({ mode }) => ({
  fontSize: "0.9rem",
  fontWeight: 500,
  paddingLeft: "0.5rem",
  display: mode === "compact" ? "none" : "block"
}));

const BulletIcon = styled("div")(({ theme }) => ({
  padding: "2px",
  marginLeft: "24px",
  marginRight: "8px",
  overflow: "hidden",
  borderRadius: "300px",
  background: theme.palette.text.primary
}));

const BadgeValue = styled("div")(() => ({
  padding: "1px 8px",
  overflow: "hidden",
  borderRadius: "300px"
}));

const NavWrapper = styled(Box)(() => ({
  padding: "0 12px"
}));

export default function MatxVerticalNav({ items }) {
  const { settings } = useSettings();
  const { mode } = settings.layout1Settings.leftSidebar;

  const renderLevels = (data) => {
    return data.map((item, index) => {
      if (item.type === "label") {
        return (
          <ListLabel key={index} mode={mode} className="sidenavHoverShow">
            {item.label}
          </ListLabel>
        );
      }

      if (item.children) {
        return (
          <MatxVerticalNavExpansionPanel mode={mode} item={item} key={index}>
            {renderLevels(item.children)}
          </MatxVerticalNavExpansionPanel>
        );
      }

      if (item.path && item.path.includes("http")) {
        return (
          <ExternalLink
            key={index} href={item.path} className={`${mode === "compact" ? "compactNavItem" : ""}`}
            rel="noopener noreferrer" target="_blank"
          >
            <Box display="flex" alignItems="center">
              {item?.icon && (
                <Icon className="icon" sx={{ color: "rgba(255,255,255,0.7)" }}>{item.icon}</Icon>
              )}
              <StyledText mode={mode} className="sidenavHoverShow">
                {item.name}
              </StyledText>
            </Box>
          </ExternalLink>
        );
      }

      return (
        <InternalLink key={index}>
          <NavLink
            to={item.path}
            className={({ isActive }) =>
              `${isActive ? "navItemActive" : ""} ${mode === "compact" ? "compactNavItem" : ""}`
            }
          >
            <Box display="flex" alignItems="center" sx={{ width: "100%" }}>
              {item?.icon && (
                <Icon className="icon" sx={{ color: "rgba(255,255,255,0.75)" }}>{item.icon}</Icon>
              )}
              {item?.iconText && <BulletIcon />}
              <StyledText mode={mode} className="sidenavHoverShow">
                {item.name}
              </StyledText>
            </Box>

            {item?.badge && (
              <BadgeValue>{item.badge.value}</BadgeValue>
            )}
          </NavLink>
        </InternalLink>
      );
    });
  };

  return <NavWrapper>{renderLevels(items)}</NavWrapper>;
}