// src/app/views/logs/LogDetailPage.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  Alert, Box, Card, Chip, CircularProgress,
  Grid, IconButton, Tooltip, Typography
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
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

const MetaChip = styled(Box)(({ theme }) => ({
  display: "inline-flex", flexDirection: "column",
  padding: "0.5rem 1rem", borderRadius: 8,
  backgroundColor: theme.palette.action.hover,
  marginRight: "0.75rem", marginBottom: "0.75rem"
}));

const ImageCard = styled(Card)(({ theme }) => ({
  overflow: "hidden",
  cursor: "pointer",
  transition: "transform 0.18s ease, box-shadow 0.18s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8]
  }
}));

const StitchedImg = styled("img")(() => ({
  width: "100%",
  height: 160,
  objectFit: "cover",
  display: "block"
}));

const ImgPlaceholder = styled(Box)(({ theme }) => ({
  width: "100%",
  height: 160,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.action.hover,
  color: theme.palette.text.disabled
}));

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

function ComplianceBadge({ label, pass }) {
  return (
    <Chip
      label={`${label}: ${pass ? "✓ Pass" : "✗ Fail"}`}
      color={pass ? "success" : "error"}
      size="small" variant="outlined" sx={{ mr: 1 }}
    />
  );
}

// ─── Component ─────────────────────────────────────────────
export default function LogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${BASE_URL}/api/v1/inspections/sessions/${id}`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        setData(await res.json());
      } catch (err) {
        setError(err.message || "Failed to load session.");
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [id]);

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>
  );

  if (error) return (
    <ContentBox><Alert severity="error">{error}</Alert></ContentBox>
  );

  const { session: s, per_pair_results, statistical_summary: stats } = data;
  const avgScore = stats.average_quality_score ?? stats.avg_quality_score ?? 0;
  const geminiDisabled = avgScore === 0 && stats.pass_count === 0 && stats.fail_count === 0;

  return (
    <ContentBox>

      {/* ── Header ── */}
      <Box display="flex" alignItems="flex-start" gap={2} mb={3}>
        <Tooltip title="Back to Logs">
          <IconButton onClick={() => navigate("/logs")} size="small" sx={{ mt: 0.5 }}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Box flexGrow={1}>
          <Typography variant="h6" fontWeight={600}>
            {s.object_name || s.object_id} — Scan #{s.scan_number}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {[s.welding_type, s.welding_position, s.side ? `Side: ${s.side}` : null]
              .filter(Boolean).join(" · ")}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Analyzed: {formatDate(s.created_at)}
            {s.remarks ? ` · Remarks: ${s.remarks}` : ""}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
          <ComplianceBadge label="AWS" pass={s.overall_compliance_aws} />
          <ComplianceBadge label="ISO" pass={s.overall_compliance_iso} />
        </Box>
      </Box>

      {/* ── Gemini pending notice ── */}
      {geminiDisabled && (
        <Alert severity="info" sx={{ mb: 2 }}>
          AI analysis is pending — scores and defect data will appear once Gemini is enabled.
        </Alert>
      )}

      {/* ── Session summary ── */}
      <SectionCard elevation={3}>
        <SectionTitle>Session Summary</SectionTitle>
        <Box display="flex" flexWrap="wrap">
          <MetaChip>
            <Typography variant="caption" color="textSecondary">Frames Analyzed</Typography>
            <Typography variant="body1" fontWeight={700}>{stats.total_frames_analyzed}</Typography>
          </MetaChip>
          <MetaChip>
            <Typography variant="caption" color="textSecondary">Defects Found</Typography>
            <Typography variant="body1" fontWeight={700}
              color={s.total_defects_found > 0 ? "error.main" : "success.main"}>
              {s.total_defects_found}
            </Typography>
          </MetaChip>
          <MetaChip>
            <Typography variant="caption" color="textSecondary">Avg Quality Score</Typography>
            <Typography variant="body1" fontWeight={700}>
              {geminiDisabled ? "—" : `${avgScore}/100`}
            </Typography>
          </MetaChip>
          <MetaChip>
            <Typography variant="caption" color="textSecondary">Pass / Review / Fail</Typography>
            <Typography variant="body1" fontWeight={700}>
              <span style={{ color: "#4caf50" }}>{stats.pass_count}</span>
              {" / "}
              <span style={{ color: "#ff9800" }}>{stats.review_count}</span>
              {" / "}
              <span style={{ color: "#f44336" }}>{stats.fail_count}</span>
            </Typography>
          </MetaChip>
        </Box>

        {/* Defect breakdown */}
        {stats.defect_breakdown?.length > 0 && (
          <Box mt={1}>
            <SectionTitle sx={{ mb: 0.5 }}>Defect Breakdown</SectionTitle>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {stats.defect_breakdown.map((d, i) => (
                <Chip key={i}
                  label={`${d.defect_type}: ${d.count} (${Math.round(d.avg_confidence * 100)}% avg confidence)`}
                  size="small" color="warning" variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
      </SectionCard>

      {/* ── Compile chart ── */}
      {s.compile_chart_url && (
        <SectionCard elevation={3}>
          <SectionTitle>Compile Chart — Full Session Overview</SectionTitle>
          <img
            src={s.compile_chart_url} alt="Compile chart"
            style={{ width: "100%", borderRadius: 8, display: "block" }}
          />
        </SectionCard>
      )}

      {/* ── Image grid ── */}
      <SectionCard elevation={3}>
        <SectionTitle>
          Analyzed Frame Pairs ({per_pair_results.length})
          <Typography component="span" variant="caption" color="textSecondary" ml={1}>
            — click any image to view full details
          </Typography>
        </SectionTitle>

        <Grid container spacing={2}>
          {per_pair_results.map((pair) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={pair.frame_index}>
              <ImageCard
                elevation={2}
                onClick={() => navigate(`/logs/${id}/frame/${pair.image_label}`)}
              >
                {/* Stitched image thumbnail */}
                {pair.stitched_image_url ? (
                  <StitchedImg
                    src={pair.stitched_image_url}
                    alt={`Frame pair ${pair.image_label}`}
                  />
                ) : (
                  <ImgPlaceholder>
                    <ImageSearchIcon sx={{ fontSize: 40 }} />
                  </ImgPlaceholder>
                )}

                {/* Card footer */}
                <Box px={1.5} py={1}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" fontWeight={700}>
                      {pair.source_frame_a_label}
                      {pair.source_frame_b_label ? ` & ${pair.source_frame_b_label}` : ""}
                    </Typography>
                    <Chip
                      label={pair.overall_result === "review" && pair.weld_quality_score === 0
                        ? "Pending" : pair.overall_result.toUpperCase()}
                      color={resultColor(pair.overall_result)}
                      size="small"
                    />
                  </Box>

                  {/* Score bar */}
                  {pair.weld_quality_score > 0 && (
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Score: {pair.weld_quality_score}/100
                      </Typography>
                      <Box
                        sx={{
                          mt: 0.5, height: 5, borderRadius: 3,
                          backgroundColor: "action.hover",
                          overflow: "hidden"
                        }}
                      >
                        <Box sx={{
                          height: "100%",
                          width: `${pair.weld_quality_score}%`,
                          backgroundColor: scoreBarColor(pair.weld_quality_score),
                          borderRadius: 3
                        }} />
                      </Box>
                    </Box>
                  )}

                  {/* Defect count */}
                  <Typography variant="caption" color="textSecondary" display="block" mt={0.5}>
                    {pair.defects?.length > 0
                      ? `${pair.defects.length} defect${pair.defects.length > 1 ? "s" : ""} found`
                      : pair.weld_quality_score > 0 ? "No defects" : ""}
                  </Typography>
                </Box>
              </ImageCard>
            </Grid>
          ))}
        </Grid>
      </SectionCard>

    </ContentBox>
  );
}