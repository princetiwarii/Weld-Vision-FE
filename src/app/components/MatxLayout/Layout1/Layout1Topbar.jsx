import { memo } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import styled from "@mui/material/styles/styled";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import Menu from "@mui/icons-material/Menu";
import useSettings from "app/hooks/useSettings";
import { themeShadows } from "app/components/MatxTheme/themeColors";
import { topBarHeight } from "app/utils/constant";

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.primary
}));

const TopbarRoot = styled("div")({
  top: 0,
  zIndex: 96,
  height: topBarHeight,
  boxShadow: themeShadows[8],
  transition: "all 0.3s ease"
});

const TopbarContainer = styled("div")(({ theme }) => ({
  padding: "8px",
  paddingLeft: 18,
  paddingRight: 20,
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: theme.palette.primary.main,
  [theme.breakpoints.down("sm")]: { paddingLeft: 16, paddingRight: 16 }
}));

const Layout1Topbar = () => {
  const theme = useTheme();
  const { settings, updateSettings } = useSettings();
  const isMdScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleSidebarToggle = () => {
    let { layout1Settings } = settings;
    let mode;
    if (isMdScreen) {
      mode = layout1Settings.leftSidebar.mode === "close" ? "mobile" : "close";
    } else {
      mode = layout1Settings.leftSidebar.mode === "full" ? "close" : "full";
    }
    updateSettings({ layout1Settings: { leftSidebar: { mode } } });
  };

  return (
    <TopbarRoot>
      <TopbarContainer>
        <Box display="flex" alignItems="center">
          <StyledIconButton onClick={handleSidebarToggle}>
            <Menu />
          </StyledIconButton>
        </Box>
        <Box>
          <span style={{ color: "#fff", fontWeight: 600, fontSize: "1rem" }}>
            WeldVision
          </span>
        </Box>
      </TopbarContainer>
    </TopbarRoot>
  );
};

export default memo(Layout1Topbar);