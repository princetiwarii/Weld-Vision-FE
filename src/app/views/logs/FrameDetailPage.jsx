// src/app/views/logs/FrameDetailPage.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  Alert, Accordion, AccordionDetails, AccordionSummary,
  Box, Card, Chip, CircularProgress, Grid,
  IconButton, LinearProgress, Tooltip, Typography
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import { BASE_URL } from "app/config";

// ─── Styled ────────────────────────────────────────────────
const ContentBox = styled("div")(({ theme }) => ({
  margin: "2rem",
  [theme.breakpoints.down("sm")]: { margin: "1rem" }
}));

const SectionCard = styled(Card)(({ theme }) => ({
  padding: "1.5rem",
  marginBottom: "1.5rem"
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.78rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.09em",
  color: theme.palette.text.secondary,
  marginBottom: "1rem"
}));

const AnnotatedImg = styled("img")(() => ({
  width: "100%",
  borderRadius: 8,
  display: "block",
  objectFit: "cover"
}));

const MetaChip = styled(Box)(({ theme }) => ({
  display: "inline-flex", flexDirection: "column",
  padding: "0.5rem 1rem", borderRadius: 8,
  backgroundColor: theme.palette.action.hover,
  marginRight: "0.75rem", marginBottom: "0.75rem"
}));

const DefectRow = styled(Box)(({ theme }) => ({
  display: "flex", alignItems: "flex-start", gap: "0.75rem",
  padding: "0.6rem 0",
  borderBottom: `1px solid ${theme.palette.divider}`,
  "&:last-child": { borderBottom: "none" }
}));

const NavButton = styled(Box)(({ theme, disabled }) => ({
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  cursor: disabled ? "default" : "pointer",
  opacity: disabled ? 0.35 : 1,
  color: theme.palette.primary.main,
  fontWeight: 600,
  fontSize: "0.875rem",
  userSelect: "none",
  "&:hover": {
    textDecoration: disabled ? "none" : "underline"
  }
}));

const SeverityColors = {
  low: "#4caf50",
  medium: "#ff9800",
  high: "#f44336",
  critical: "#b71c1c"
};

// ─── Helpers ───────────────────────────────────────────────
function resultColor(r) {
  if (r === "pass") return "success";
  if (r === "fail") return "error";
  return "warning";
}

function scoreBarColor(s) {
  if (s >= 85) return "#4caf50";
  if (s >= 60) return "#ff9800";
  return "#f44336";
}

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

// ─── Component ─────────────────────────────────────────────
export default function FrameDetailPage() {
  const { id, imageLabel } = useParams();
  const navigate = useNavigate();

  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${BASE_URL}/api/v1/inspections/sessions/${id}`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        setSessionData(await res.json());
      } catch (err) {
        setError(err.message || "Failed to load frame details.");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id]);

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>
  );

  if (error) return (
    <ContentBox><Alert severity="error">{error}</Alert></ContentBox>
  );

  const { session: s, per_pair_results } = sessionData;

  // Find the current pair by image_label
  const currentIndex = per_pair_results.findIndex(
    (p) => p.image_label === imageLabel
  );

  if (currentIndex === -1) return (
    <ContentBox>
      <Alert severity="error">Frame "{imageLabel}" not found in this session.</Alert>
    </ContentBox>
  );

  const pair = per_pair_results[currentIndex];
  const prevPair = per_pair_results[currentIndex - 1] || null;
  const nextPair = per_pair_results[currentIndex + 1] || null;

  const geminiDisabled = pair.weld_quality_score === 0 && pair.overall_result === "review";

  const navigateToFrame = (label) => {
    navigate(`/logs/${id}/frame/${label}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ContentBox>

      {/* ── Header ── */}
      <Box display="flex" alignItems="flex-start" gap={2} mb={3}>
        <Tooltip title="Back to session">
          <IconButton onClick={() => navigate(`/logs/${id}`)} size="small" sx={{ mt: 0.5 }}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Box flexGrow={1}>
          <Typography variant="h6" fontWeight={600}>
            Frame {pair.source_frame_a_label}
            {pair.source_frame_b_label ? ` & ${pair.source_frame_b_label}` : ""}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {s.object_name || s.object_id} — Scan #{s.scan_number} · {formatDate(s.created_at)}
          </Typography>
        </Box>

        {/* Result chip */}
        <Chip
          label={geminiDisabled
            ? "AI Pending"
            : pair.overall_result.toUpperCase()}
          color={resultColor(pair.overall_result)}
          sx={{ fontWeight: 600, alignSelf: "center" }}
        />
      </Box>

      {/* ── Prev / Next navigation ── */}
      <Box display="flex" justifyContent="space-between" mb={2.5}>
        <NavButton
          disabled={!prevPair}
          onClick={() => prevPair && navigateToFrame(prevPair.image_label)}
        >
          ← {prevPair ? `${prevPair.source_frame_a_label}${prevPair.source_frame_b_label ? ` & ${prevPair.source_frame_b_label}` : ""}` : "No previous"}
        </NavButton>
        <Typography variant="caption" color="textSecondary" alignSelf="center">
          {currentIndex + 1} / {per_pair_results.length}
        </Typography>
        <NavButton
          disabled={!nextPair}
          onClick={() => nextPair && navigateToFrame(nextPair.image_label)}
        >
          {nextPair ? `${nextPair.source_frame_a_label}${nextPair.source_frame_b_label ? ` & ${nextPair.source_frame_b_label}` : ""}` : "No next"} →
        </NavButton>
      </Box>

      {/* ── AI pending notice ── */}
      {geminiDisabled && (
        <Alert severity="info" sx={{ mb: 2 }}>
          AI analysis is pending for this frame — scores and defect data will appear once Gemini is enabled.
        </Alert>
      )}

      {/* ── Score summary ── */}
      <SectionCard elevation={3}>
        <SectionTitle>Frame Summary</SectionTitle>
        <Box display="flex" flexWrap="wrap">
          <MetaChip>
            <Typography variant="caption" color="textSecondary">Quality Score</Typography>
            <Typography variant="body1" fontWeight={700}>
              {geminiDisabled ? "—" : `${pair.weld_quality_score}/100`}
            </Typography>
          </MetaChip>
          <MetaChip>
            <Typography variant="caption" color="textSecondary">Defects</Typography>
            <Typography variant="body1" fontWeight={700}
              color={pair.defects?.length > 0 ? "error.main" : "success.main"}>
              {geminiDisabled ? "—" : (pair.defects?.length || 0)}
            </Typography>
          </MetaChip>
          <MetaChip>
            <Typography variant="caption" color="textSecondary">Result</Typography>
            <Typography variant="body1" fontWeight={700}
              color={
                pair.overall_result === "pass" ? "#4caf50"
                : pair.overall_result === "fail" ? "#f44336"
                : "#ff9800"
              }>
              {geminiDisabled ? "Pending" : pair.overall_result.toUpperCase()}
            </Typography>
          </MetaChip>
          {pair.timestamp_a_seconds != null && (
            <MetaChip>
              <Typography variant="caption" color="textSecondary">Timestamp</Typography>
              <Typography variant="body1" fontWeight={700}>
                {pair.timestamp_a_seconds}s
                {pair.timestamp_b_seconds != null ? ` – ${pair.timestamp_b_seconds}s` : ""}
              </Typography>
            </MetaChip>
          )}
        </Box>

        {/* Score progress bar */}
        {!geminiDisabled && pair.weld_quality_score > 0 && (
          <Box mt={1}>
            <LinearProgress
              variant="determinate"
              value={pair.weld_quality_score}
              sx={{
                height: 8, borderRadius: 4,
                backgroundColor: "action.hover",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: scoreBarColor(pair.weld_quality_score),
                  borderRadius: 4
                }
              }}
            />
          </Box>
        )}

        {/* Standards compliance */}
        {pair.standards_compliance?.length > 0 && (
          <Box mt={2}>
            <SectionTitle sx={{ mb: 0.5 }}>Standards Compliance</SectionTitle>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {pair.standards_compliance.map((sc, i) => (
                <Chip key={i}
                  label={`${sc.standard}${sc.grade ? ` Grade ${sc.grade}` : ""}: ${sc.compliant ? "✓ Pass" : "✗ Fail"}${sc.notes ? ` — ${sc.notes}` : ""}`}
                  color={sc.compliant ? "success" : "error"}
                  size="small" variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
      </SectionCard>

      {/* ── Images: stitched + annotated ── */}
      <SectionCard elevation={3}>
        <SectionTitle>Images</SectionTitle>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="textSecondary"
              display="block" mb={0.75} fontWeight={600}>
              STITCHED FRAMES
            </Typography>
            {pair.stitched_image_url ? (
              <AnnotatedImg src={pair.stitched_image_url} alt="Stitched frames" />
            ) : (
              <Box sx={{
                height: 200, borderRadius: 2, backgroundColor: "action.hover",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Typography variant="caption" color="textSecondary">Not available</Typography>
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="textSecondary"
              display="block" mb={0.75} fontWeight={600}>
              ANNOTATED IMAGE
            </Typography>
            {pair.annotated_image_url ? (
              <AnnotatedImg src={pair.annotated_image_url} alt="Annotated result" />
            ) : (
              <Box sx={{
                height: 200, borderRadius: 2, backgroundColor: "action.hover",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Typography variant="caption" color="textSecondary">Not available</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </SectionCard>

      {/* ── Defects ── */}
      <SectionCard elevation={3}>
        <SectionTitle>Defects Detected</SectionTitle>

        {geminiDisabled ? (
          <Typography variant="body2" color="textSecondary">
            Defect data will appear once AI analysis is enabled.
          </Typography>
        ) : pair.defects?.length === 0 ? (
          <Box display="flex" alignItems="center" gap={1} color="success.main">
            <CheckCircleOutlineIcon fontSize="small" />
            <Typography variant="body2">No defects detected in this frame pair.</Typography>
          </Box>
        ) : (
          pair.defects.map((d, i) => (
            <Accordion key={d.defect_id || i} disableGutters elevation={0}
              sx={{
                border: "1px solid", borderColor: "divider",
                borderRadius: "8px !important", mb: 1,
                "&:before": { display: "none" }
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                  <Box sx={{
                    width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                    backgroundColor: SeverityColors[d.severity] || "#999"
                  }} />
                  <Typography variant="body2" fontWeight={600}>{d.type}</Typography>
                  <Chip
                    label={d.severity}
                    size="small"
                    sx={{
                      backgroundColor: SeverityColors[d.severity] || "#999",
                      color: "#fff", height: 18, fontSize: "0.7rem"
                    }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    {d.position}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Confidence: {Math.round((d.confidence || 0) * 100)}%
                  </Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Grid container spacing={2}>

                  {/* Left: description + dimensions */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary" mb={1}>
                      {d.description}
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {d.length_mm != null && (
                        <Chip label={`Length: ${d.length_mm}mm`} size="small" variant="outlined" />
                      )}
                      {d.width_mm != null && (
                        <Chip label={`Width: ${d.width_mm}mm`} size="small" variant="outlined" />
                      )}
                      {d.depth_mm != null && (
                        <Chip label={`Depth: ${d.depth_mm}mm`} size="small" variant="outlined" />
                      )}
                    </Box>
                    {d.standards_reference && (
                      <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                        Reference: {d.standards_reference}
                      </Typography>
                    )}
                  </Grid>

                  {/* Right: recommendation */}
                  {d.recommendation && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{
                        p: 1.5, borderRadius: 2,
                        backgroundColor: "action.hover",
                        borderLeft: "3px solid",
                        borderColor: "primary.main"
                      }}>
                        <Typography variant="caption" color="textSecondary"
                          display="block" fontWeight={700} mb={0.5}>
                          RECOMMENDATION
                        </Typography>
                        <Typography variant="body2">{d.recommendation}</Typography>
                      </Box>
                    </Grid>
                  )}

                </Grid>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </SectionCard>

      {/* ── Recommendations ── */}
      {pair.recommendations?.length > 0 && (
        <SectionCard elevation={3}>
          <SectionTitle>Recommendations</SectionTitle>
          {pair.recommendations.map((r, i) => (
            <DefectRow key={i}>
              <BuildOutlinedIcon fontSize="small" color="primary"
                sx={{ mt: "2px", flexShrink: 0 }} />
              <Typography variant="body2">{r}</Typography>
            </DefectRow>
          ))}
        </SectionCard>
      )}

      {/* ── AI notes ── */}
      {pair.model_notes && (
        <SectionCard elevation={3}>
          <SectionTitle>AI Notes</SectionTitle>
          <Typography variant="body2" color="textSecondary" lineHeight={1.8}>
            {pair.model_notes}
          </Typography>
        </SectionCard>
      )}

      {/* ── Bottom prev/next ── */}
      <Box display="flex" justifyContent="space-between" mt={1}>
        <NavButton
          disabled={!prevPair}
          onClick={() => prevPair && navigateToFrame(prevPair.image_label)}
        >
          ← Previous Frame
        </NavButton>
        <NavButton
          disabled={!nextPair}
          onClick={() => nextPair && navigateToFrame(nextPair.image_label)}
        >
          Next Frame →
        </NavButton>
      </Box>

    </ContentBox>
  );
}