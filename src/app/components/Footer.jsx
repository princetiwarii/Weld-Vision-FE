import { styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";

const FooterRoot = styled("div")(({ theme }) => ({
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 24px",
  borderTop: `1px solid ${theme.palette.divider}`
}));

const Footer = () => (
  <FooterRoot>
    <Typography variant="caption" color="textSecondary">
      WeldVision © {new Date().getFullYear()}
    </Typography>
  </FooterRoot>
);

export default Footer;