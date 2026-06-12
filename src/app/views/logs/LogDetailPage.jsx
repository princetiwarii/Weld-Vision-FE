// src/app/views/logs/LogDetailPage.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  Alert, Box, Card, Chip, CircularProgress, Divider,
  IconButton, LinearProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Tooltip, Typography
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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

const MetaChip = styled(Box)(({ theme }) => ({
  display: "inline-flex", flexDirection: "column",
  padding: "0.5rem 1rem", borderRadius: 8,
  backgroundColor: theme.palette.action.hover,
  marginRight: "0.75rem", marginBottom: "0.75rem"
}));

const FullImg = styled("img")(() => ({
  width: "100%",
  borderRadius: 8,
  display: "block",
  objectFit: "cover",
  cursor: "zoom-in",
  transition: "opacity 0.15s ease",
  "&:hover": { opacity: 0.88 }
}));

const ImgLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.72rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: theme.palette.text.disabled,
  marginBottom: "0.5rem"
}));

const PairDivider = styled(Divider)(() => ({
  marginBottom: "1.5rem",
  marginTop: "0.5rem"
}));

const StyledDefectTable = styled(Table)(() => ({
  "& .MuiTableCell-root": {
    paddingLeft: "14px",
    paddingRight: "14px",
    paddingTop: "10px",
    paddingBottom: "10px",
    fontSize: "0.82rem"
  },
  "& .MuiTableCell-head": {
    paddingTop: "10px",
    paddingBottom: "10px",
    fontSize: "0.75rem",
    fontWeight: 700
  }
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover
}));

const RecommendationBox = styled(Box)(({ theme }) => ({
  padding: "0.75rem 1rem",
  borderRadius: 8,
  backgroundColor: theme.palette.action.hover,
  borderLeft: "3px solid",
  borderColor: theme.palette.primary.main,
  marginBottom: "0.5rem"
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

function ComplianceBadge({ label, pass }) {
  return (
    <Chip
      label={`${label}: ${pass ? "✓ Pass" : "✗ Fail"}`}
      color={pass ? "success" : "error"}
      size="small" variant="outlined" sx={{ mr: 1 }}
    />
  );
}

// ─── Lightbox ──────────────────────────────────────────────
function Lightbox({ src, onClose }) {
  if (!src) return null;
  return (
    <Box
      onClick={onClose}
      sx={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.92)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "zoom-out",
        p: 2
      }}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{ position: "relative", maxWidth: "95vw", maxHeight: "95vh" }}
      >
        <img
          src={src}
          alt="Full view"
          style={{
            maxWidth: "95vw",
            maxHeight: "90vh",
            borderRadius: 8,
            objectFit: "contain",
            display: "block"
          }}
        />
        <Box
          onClick={onClose}
          sx={{
            position: "absolute",
            top: -16, right: -16,
            width: 32, height: 32,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#fff", fontWeight: 700, fontSize: "1rem",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" }
          }}
        >
          ✕
        </Box>
      </Box>
    </Box>
  );
}

// ─── Single pair section ────────────────────────────────────
function PairSection({ pair, index, onImageClick }) {
  const isPending = pair.weld_quality_score === 0 && pair.overall_result === "review";

  return (
    <Box mb={4}>

      {/* ── Pair header ── */}
      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
        <Box sx={{
          width: 28, height: 28, borderRadius: "50%",
          backgroundColor: "action.hover",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: "0.8rem", flexShrink: 0
        }}>
          {index + 1}
        </Box>
        <Typography variant="subtitle1" fontWeight={700}>
          {pair.source_frame_a_label}
          {pair.source_frame_b_label ? ` + ${pair.source_frame_b_label}` : ""}
        </Typography>
        <Chip
          label={isPending ? "AI Pending" : pair.overall_result.toUpperCase()}
          color={resultColor(pair.overall_result)}
          size="small" sx={{ fontWeight: 600 }}
        />
        {!isPending && pair.weld_quality_score > 0 && (
          <Typography variant="caption" color="textSecondary">
            Score: <strong>{pair.weld_quality_score}/100</strong>
          </Typography>
        )}
      </Box>

      {/* ── Score bar ── */}
      {!isPending && pair.weld_quality_score > 0 && (
        <Box mb={2}>
          <LinearProgress
            variant="determinate"
            value={pair.weld_quality_score}
            sx={{
              height: 7, borderRadius: 4,
              backgroundColor: "action.hover",
              "& .MuiLinearProgress-bar": {
                backgroundColor: scoreBarColor(pair.weld_quality_score),
                borderRadius: 4
              }
            }}
          />
        </Box>
      )}

      {/* ── Original image ── */}
      <ImgLabel>Original Image</ImgLabel>
      <FullImg
        src={pair.stitched_image_url}
        alt={`${pair.source_frame_a_label} original`}
        sx={{ mb: 2.5 }}
        onClick={() => onImageClick(pair.stitched_image_url)}
      />

      {/* ── AI Labeled image ── */}
      <ImgLabel>AI Labeled Image</ImgLabel>
      <FullImg
        src={pair.annotated_image_url}
        alt={`${pair.source_frame_a_label} labeled`}
        sx={{ mb: 2.5 }}
        onClick={() => onImageClick(pair.annotated_image_url)}
      />

      {/* ── Defects table ── */}
      <ImgLabel sx={{ mb: 1 }}>Defect Analysis</ImgLabel>
      {isPending ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          AI analysis pending — defect data will appear once Gemini is enabled.
        </Alert>
      ) : pair.defects?.length === 0 ? (
        <Box display="flex" alignItems="center" gap={1}
          color="success.main" mb={2}>
          <CheckCircleOutlineIcon fontSize="small" />
          <Typography variant="body2">No defects detected in this pair.</Typography>
        </Box>
      ) : (
        <Card elevation={0} variant="outlined"
          sx={{ mb: 2.5, borderRadius: 2, overflow: "hidden" }}>
          <TableContainer sx={{ overflowX: "auto" }}>
            <StyledDefectTable sx={{ minWidth: 700 }}>
              <StyledTableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Dimensions</TableCell>
                  <TableCell align="center">Confidence</TableCell>
                  <TableCell>Standard Ref</TableCell>
                  <TableCell>Recommendation</TableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {pair.defects.map((d, i) => (
                  <TableRow key={d.defect_id || i}
                    sx={{ "&:hover": { backgroundColor: "action.hover" } }}>

                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {i + 1}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {d.type}
                      </Typography>
                      {d.description && (
                        <Tooltip title={d.description} arrow>
                          <Typography variant="caption" color="textSecondary"
                            sx={{
                              display: "block", maxWidth: 160,
                              overflow: "hidden", textOverflow: "ellipsis",
                              whiteSpace: "nowrap", cursor: "help"
                            }}>
                            {d.description}
                          </Typography>
                        </Tooltip>
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={d.severity}
                        size="small"
                        sx={{
                          backgroundColor: SeverityColors[d.severity] || "#999",
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: "0.72rem"
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{d.position || "—"}</Typography>
                    </TableCell>

                    <TableCell>
                      <Box display="flex" flexDirection="column" gap={0.25}>
                        {d.length_mm != null && (
                          <Typography variant="caption">L: {d.length_mm}mm</Typography>
                        )}
                        {d.width_mm != null && (
                          <Typography variant="caption">W: {d.width_mm}mm</Typography>
                        )}
                        {d.depth_mm != null && (
                          <Typography variant="caption">D: {d.depth_mm}mm</Typography>
                        )}
                        {d.count != null && (
                          <Typography variant="caption">Count: {d.count}</Typography>
                        )}
                        {d.length_mm == null && d.width_mm == null
                          && d.depth_mm == null && d.count == null && (
                          <Typography variant="caption" color="textSecondary">—</Typography>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600}
                        color={
                          (d.confidence || 0) >= 0.85 ? "success.main"
                          : (d.confidence || 0) >= 0.6 ? "warning.main"
                          : "error.main"
                        }>
                        {Math.round((d.confidence || 0) * 100)}%
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" color="textSecondary">
                        {d.standards_reference || "—"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption"
                        sx={{ maxWidth: 180, display: "block" }}>
                        {d.recommendation || "—"}
                      </Typography>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </StyledDefectTable>
          </TableContainer>
        </Card>
      )}

      {/* ── Standards compliance ── */}
      {pair.standards_compliance?.length > 0 && (
        <Box mb={2}>
          <ImgLabel sx={{ mb: 0.75 }}>Standards Compliance</ImgLabel>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {pair.standards_compliance.map((sc, i) => (
              <Tooltip key={i} title={sc.notes || ""} arrow>
                <Chip
                  label={`${sc.standard}${sc.grade ? ` Grade ${sc.grade}` : ""}: ${sc.compliant ? "✓ Pass" : "✗ Fail"}`}
                  color={sc.compliant ? "success" : "error"}
                  size="small" variant="outlined"
                  sx={{ cursor: "help" }}
                />
              </Tooltip>
            ))}
          </Box>
        </Box>
      )}

      {/* ── Recommendations ── */}
      {pair.recommendations?.length > 0 && (
        <Box mb={1}>
          <ImgLabel sx={{ mb: 0.75 }}>Recommendations</ImgLabel>
          {pair.recommendations.map((r, i) => (
            <RecommendationBox key={i}>
              <Box display="flex" gap={1}>
                <BuildOutlinedIcon fontSize="small" color="primary"
                  sx={{ mt: "2px", flexShrink: 0 }} />
                <Typography variant="body2">{r}</Typography>
              </Box>
            </RecommendationBox>
          ))}
        </Box>
      )}

      {/* ── AI notes ── */}
      {pair.model_notes && (
        <Box>
          <ImgLabel sx={{ mb: 0.5 }}>AI Notes</ImgLabel>
          <Typography variant="body2" color="textSecondary" lineHeight={1.8}>
            {pair.model_notes}
          </Typography>
        </Box>
      )}

      <PairDivider />
    </Box>
  );
}

// ─── Main component ─────────────────────────────────────────
export default function LogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") setLightboxImg(null); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
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
    fetchData();
  }, [id]);

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={8}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <ContentBox><Alert severity="error">{error}</Alert></ContentBox>
  );

  const { session: s, per_pair_results, statistical_summary: stats } = data;
  const avgScore = stats.average_quality_score ?? stats.avg_quality_score ?? 0;
  const geminiDisabled = avgScore === 0 && stats.pass_count === 0 && stats.fail_count === 0;

  return (
    <ContentBox>

      {/* ── Lightbox ── */}
      <Lightbox src={lightboxImg} onClose={() => setLightboxImg(null)} />

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
            {[s.welding_type, s.welding_position,
              s.side ? `Side: ${s.side}` : null]
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
            <Typography variant="caption" color="textSecondary">Total Images</Typography>
            <Typography variant="body1" fontWeight={700}>{s.frames_extracted}</Typography>
          </MetaChip>
          <MetaChip>
            <Typography variant="caption" color="textSecondary">Pairs Analyzed</Typography>
            <Typography variant="body1" fontWeight={700}>{per_pair_results.length}</Typography>
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
      {/* {s.compile_chart_url && (
        <SectionCard elevation={3}>
          <SectionTitle>Full Session Overview Chart</SectionTitle>
          <FullImg
            src={s.compile_chart_url}
            alt="Compile chart"
            onClick={() => setLightboxImg(s.compile_chart_url)}
          />
        </SectionCard>
      )} */}

      {/* ── All pairs ── */}
      <SectionCard elevation={3}>
        <SectionTitle>
          Pair-by-Pair Analysis — {per_pair_results.length} pair{per_pair_results.length !== 1 ? "s" : ""}
        </SectionTitle>
        {per_pair_results.map((pair, index) => (
          <PairSection
            key={pair.frame_index}
            pair={pair}
            index={index}
            onImageClick={setLightboxImg}
          />
        ))}
      </SectionCard>

    </ContentBox>
  );
}