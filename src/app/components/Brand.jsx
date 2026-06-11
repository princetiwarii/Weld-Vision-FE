import styled from "@mui/material/styles/styled";
import Box from "@mui/material/Box";
import { Span } from "./Typography";
import useSettings from "app/hooks/useSettings";

const BrandRoot = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "24px 18px 24px 24px"
}));

const AppName = styled(Span)(({ mode }) => ({
  fontSize: 17,
  fontWeight: 700,
  letterSpacing: "0.04em",
  color: "#fff",
  display: mode === "compact" ? "none" : "block"
}));

const LogoDot = styled("div")(() => ({
  width: 32,
  height: 32,
  borderRadius: 8,
  backgroundColor: "rgba(255,255,255,0.2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 15,
  fontWeight: 800,
  color: "#fff",
  flexShrink: 0
}));

export default function Brand({ children }) {
  const { settings } = useSettings();
  const { mode } = settings.layout1Settings.leftSidebar;

  return (
    <BrandRoot>
      <Box display="flex" alignItems="center" gap={1.5}>
        <LogoDot>W</LogoDot>
        <AppName mode={mode} className="sidenavHoverShow">
          WeldVision
        </AppName>
      </Box>
      {/* <Box className="sidenavHoverShow" sx={{ display: mode === "compact" ? "none" : "block" }}>
        {children || null}
      </Box> */}
    </BrandRoot>
  );
}