// src/app/views/logs/LogDetailPage.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  Alert,
  Box,
  Card,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useRef, useCallback } from "react";
import { BASE_URL } from "app/config";

import Button from "@mui/material/Button";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// ─── Styled ────────────────────────────────────────────────
const ContentBox = styled("div")(({ theme }) => ({
  margin: "2rem",
  [theme.breakpoints.down("sm")]: { margin: "1rem" },
}));

const SectionCard = styled(Card)(({ theme }) => ({
  padding: "1.5rem",
  marginBottom: "1.5rem",
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.78rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.09em",
  color: theme.palette.text.secondary,
  marginBottom: "1rem",
}));

const MetaChip = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  flexDirection: "column",
  padding: "0.5rem 1rem",
  borderRadius: 8,
  backgroundColor: theme.palette.action.hover,
  marginRight: "0.75rem",
  marginBottom: "0.75rem",
}));

const FullImg = styled("img")(() => ({
  width: "100%",
  borderRadius: 8,
  display: "block",
  objectFit: "cover",
  cursor: "zoom-in",
  transition: "opacity 0.15s ease",
  "&:hover": { opacity: 0.88 },
}));

const ImgLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.72rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: theme.palette.text.disabled,
  marginBottom: "0.5rem",
}));

const PairDivider = styled(Divider)(() => ({
  marginBottom: "1.5rem",
  marginTop: "0.5rem",
}));

const StyledDefectTable = styled(Table)(() => ({
  "& .MuiTableCell-root": {
    paddingLeft: "14px",
    paddingRight: "14px",
    paddingTop: "10px",
    paddingBottom: "10px",
    fontSize: "0.82rem",
  },
  "& .MuiTableCell-head": {
    paddingTop: "10px",
    paddingBottom: "10px",
    fontSize: "0.75rem",
    fontWeight: 700,
  },
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
}));

const RecommendationBox = styled(Box)(({ theme }) => ({
  padding: "0.75rem 1rem",
  borderRadius: 8,
  backgroundColor: theme.palette.action.hover,
  borderLeft: "3px solid",
  borderColor: theme.palette.primary.main,
  marginBottom: "0.5rem",
}));

const SeverityColors = {
  low: "#4caf50",
  medium: "#ff9800",
  high: "#f44336",
  critical: "#b71c1c",
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
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ComplianceBadge({ label, pass }) {
  return (
    <Chip
      label={`${label}: ${pass ? "✓ Pass" : "✗ Fail"}`}
      color={pass ? "success" : "error"}
      size="small"
      variant="outlined"
      sx={{ mr: 1 }}
    />
  );
}

// ─── Lightbox ──────────────────────────────────────────────
const MIN_SCALE = 1;
const MAX_SCALE = 6;

function Lightbox({ src, onClose }) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null); // { startX, startY, origX, origY }
  const pinchRef = useRef(null); // { startDist, startScale }
  const containerRef = useRef(null);
  

  // reset transform whenever a new image opens
  useEffect(() => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }, [src]);

  const clampScale = (v) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, v));

  const zoomBy = useCallback((factor, center) => {
    setScale((prevScale) => {
      const newScale = clampScale(prevScale * factor);
      if (newScale === 1) {
        setPos({ x: 0, y: 0 });
      } else if (center) {
        // keep zoom centered on cursor/touch point
        setPos((prevPos) => {
          const ratio = newScale / prevScale;
          return {
            x: center.x - (center.x - prevPos.x) * ratio,
            y: center.y - (center.y - prevPos.y) * ratio,
          };
        });
      }
      return newScale;
    });
  }, []);

  const handleWheel = (e) => {
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const center = {
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    };
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    zoomBy(factor, center);
  };

  const handleDoubleClick = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const center = {
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    };
    if (scale > 1) {
      setScale(1);
      setPos({ x: 0, y: 0 });
    } else {
      zoomBy(2.5, center);
    }
  };

  // ── Mouse drag (pan) ──
  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current) return;
    const { startX, startY, origX, origY } = dragRef.current;
    setPos({
      x: origX + (e.clientX - startX),
      y: origY + (e.clientY - startY),
    });
  };

  const handleMouseUp = () => {
    dragRef.current = null;
  };

  // ── Touch (pinch zoom + pan) ──
  const touchDistance = (touches) => {
    const [a, b] = touches;
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchRef.current = {
        startDist: touchDistance(e.touches),
        startScale: scale,
      };
    } else if (e.touches.length === 1 && scale > 1) {
      const t = e.touches[0];
      dragRef.current = {
        startX: t.clientX,
        startY: t.clientY,
        origX: pos.x,
        origY: pos.y,
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const dist = touchDistance(e.touches);
      const ratio = dist / pinchRef.current.startDist;
      setScale(clampScale(pinchRef.current.startScale * ratio));
    } else if (e.touches.length === 1 && dragRef.current) {
      const t = e.touches[0];
      const { startX, startY, origX, origY } = dragRef.current;
      setPos({
        x: origX + (t.clientX - startX),
        y: origY + (t.clientY - startY),
      });
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) pinchRef.current = null;
    if (e.touches.length === 0) dragRef.current = null;
    if (scale === 1) setPos({ x: 0, y: 0 });
  };

  if (!src) return null;

  return (
    <Box
      onClick={onClose}
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.92)",
        zIndex: 11111112,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: scale > 1 ? "grab" : "zoom-out",
        p: 2,
      }}
    >
      <Box
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        sx={{
          position: "relative",
          width: "95vw",
          height: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          touchAction: "none",
        }}
      >
        <img
          src={src}
          alt="Full view"
          draggable={false}
          style={{
            maxWidth: "95vw",
            maxHeight: "90vh",
            borderRadius: 8,
            objectFit: "contain",
            display: "block",
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition:
              dragRef.current || pinchRef.current
                ? "none"
                : "transform 0.12s ease-out",
            cursor: scale > 1 ? "grab" : "zoom-in",
            userSelect: "none",
          }}
        />

        {/* ── Zoom controls ── */}
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            borderRadius: 3,
            p: 0.5,
          }}
        >
          <Tooltip title="Zoom out">
            <span>
              <IconButton
                size="small"
                onClick={() => zoomBy(1 / 1.4)}
                disabled={scale <= MIN_SCALE}
                sx={{ color: "#fff" }}
              >
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Reset zoom">
            <span>
              <IconButton
                size="small"
                onClick={() => {
                  setScale(1);
                  setPos({ x: 0, y: 0 });
                }}
                disabled={scale === 1}
                sx={{ color: "#fff" }}
              >
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Zoom in">
            <span>
              <IconButton
                size="small"
                onClick={() => zoomBy(1.4)}
                disabled={scale >= MAX_SCALE}
                sx={{ color: "#fff" }}
              >
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {/* ── Close button ── */}
        <Box
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#fff",
            fontWeight: 700,
            fontSize: "1rem",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
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
  const isPending =
    pair.weld_quality_score === 0 && pair.overall_result === "review";

    

  return (
    <Box mb={4}>
      {/* ── Pair header ── */}
      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            backgroundColor: "action.hover",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "0.8rem",
            flexShrink: 0,
          }}
        >
          {index + 1}
        </Box>
        <Typography variant="subtitle1" fontWeight={700}>
          {pair.source_frame_a_label}
          {pair.source_frame_b_label ? ` + ${pair.source_frame_b_label}` : ""}
        </Typography>
        <Chip
          label={isPending ? "AI Pending" : pair.overall_result.toUpperCase()}
          color={resultColor(pair.overall_result)}
          size="small"
          sx={{ fontWeight: 600 }}
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
              height: 7,
              borderRadius: 4,
              backgroundColor: "action.hover",
              "& .MuiLinearProgress-bar": {
                backgroundColor: scoreBarColor(pair.weld_quality_score),
                borderRadius: 4,
              },
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
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          color="success.main"
          mb={2}
        >
          <CheckCircleOutlineIcon fontSize="small" />
          <Typography variant="body2">
            No defects detected in this pair.
          </Typography>
        </Box>
      ) : (
        <Card
          elevation={0}
          variant="outlined"
          sx={{ mb: 2.5, borderRadius: 2, overflow: "hidden" }}
        >
          <TableContainer sx={{ overflowX: "auto" }}>
            <StyledDefectTable sx={{ minWidth: 700 }}>
              <StyledTableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Dimensions</TableCell>
                  <TableCell align="center">Confidence</TableCell>
                  <TableCell>Standard Ref</TableCell>
                  <TableCell sx={{ width: "32%" }}>Recommendation</TableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {pair.defects.map((d, i) => (
                  <TableRow
                    key={d.defect_id || i}
                    sx={{ "&:hover": { backgroundColor: "action.hover" } }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {d.type}
                      </Typography>
                      {d.description && (
                        <Tooltip title={d.description} arrow>
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            sx={{
                              display: "block",
                              maxWidth: 160,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              cursor: "help",
                            }}
                          >
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
                          fontSize: "0.72rem",
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {d.position || "—"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box display="flex" flexDirection="column" gap={0.25}>
                        {d.length_mm != null && (
                          <Typography variant="caption">
                            L: {d.length_mm}mm
                          </Typography>
                        )}
                        {d.width_mm != null && (
                          <Typography variant="caption">
                            W: {d.width_mm}mm
                          </Typography>
                        )}
                        {d.depth_mm != null && (
                          <Typography variant="caption">
                            D: {d.depth_mm}mm
                          </Typography>
                        )}
                        {d.count != null && (
                          <Typography variant="caption">
                            Count: {d.count}
                          </Typography>
                        )}
                        {d.length_mm == null &&
                          d.width_mm == null &&
                          d.depth_mm == null &&
                          d.count == null && (
                            <Typography variant="caption" color="textSecondary">
                              —
                            </Typography>
                          )}
                      </Box>
                    </TableCell>

                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={
                          (d.confidence || 0) >= 0.85
                            ? "success.main"
                            : (d.confidence || 0) >= 0.6
                              ? "warning.main"
                              : "error.main"
                        }
                      >
                        {Math.round((d.confidence || 0) * 100)}%
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" color="textSecondary">
                        {d.standards_reference || "—"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{ display: "block", whiteSpace: "normal" }}
                      >
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
                  size="small"
                  variant="outlined"
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
                <BuildOutlinedIcon
                  fontSize="small"
                  color="primary"
                  sx={{ mt: "2px", flexShrink: 0 }}
                />
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
  const [page, setPage] = useState(0);

  const topRef = useRef(null);

const goToPage = (p) => {
  setPage(p);
  topRef.current?.scrollIntoView({ behavior: "smooth" });
};

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setLightboxImg(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${BASE_URL}/api/v1/inspections/sessions/${id}`,
        );
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

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <ContentBox>
        <Alert severity="error">{error}</Alert>
      </ContentBox>
    );

  const { session: s, per_pair_results, statistical_summary: stats } = data;
  const avgScore = stats.average_quality_score ?? stats.avg_quality_score ?? 0;
  const currentPair = per_pair_results[page];
  const geminiDisabled =
    avgScore === 0 && stats.pass_count === 0 && stats.fail_count === 0;

    const PaginationControls = () =>
  per_pair_results.length > 1 ? (
    <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIosNewIcon />}
        disabled={page === 0}
        onClick={() => goToPage(page - 1)}
      >
        Previous
      </Button>
      {/* <Typography variant="body2" color="textSecondary" fontWeight={600}>
        Pair {page + 1} of {per_pair_results.length}
      </Typography> */}
      <Button
        variant="outlined"
        endIcon={<ArrowForwardIcon />}
        disabled={page === per_pair_results.length - 1}
        onClick={() => goToPage(page + 1)}
      >
        Next
      </Button>
    </Box>
  ) : null;

  return (
    <ContentBox>
        <div ref={topRef} />  
      {/* ── Lightbox ── */}
      <Lightbox src={lightboxImg} onClose={() => setLightboxImg(null)} />

    

      {/* ── Header ── */}
      <Box display="flex" alignItems="flex-start" gap={2} mb={3}>
        <Tooltip title="Back to Logs">
          <IconButton
            onClick={() => navigate("/logs")}
            size="small"
            sx={{ mt: 0.5 }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Box flexGrow={1}>
          <Typography variant="h6" fontWeight={600}>
            {s.object_name || s.object_id} — Scan #{s.scan_number}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {[
              s.welding_type,
              s.welding_position,
              s.side ? `Side: ${s.side}` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Analyzed: {formatDate(s.created_at)}
            {s.remarks ? ` · Remarks: ${s.remarks}` : ""}
          </Typography>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-end"
          gap={0.5}
        >
          <ComplianceBadge label="AWS" pass={s.overall_compliance_aws} />
          <ComplianceBadge label="ISO" pass={s.overall_compliance_iso} />
        </Box>
      </Box>

      {geminiDisabled && (
        <Alert severity="info" sx={{ mb: 2 }}>
          AI analysis is pending — scores and defect data will appear once
          Gemini is enabled.
        </Alert>
      )}

      {/* ── Session summary ── */}
      <SectionCard elevation={3}>
        <SectionTitle>Session Summary</SectionTitle>
        <Box display="flex" flexWrap="wrap">
          <MetaChip>
            <Typography variant="caption" color="textSecondary">
              Total Images
            </Typography>
            <Typography variant="body1" fontWeight={700}>
              {s.frames_extracted}
            </Typography>
          </MetaChip>
          <MetaChip>
            <Typography variant="caption" color="textSecondary">
              Pairs Analyzed
            </Typography>
            <Typography variant="body1" fontWeight={700}>
              {per_pair_results.length}
            </Typography>
          </MetaChip>
          <MetaChip>
            <Typography variant="caption" color="textSecondary">
              Defects Found
            </Typography>
            <Typography
              variant="body1"
              fontWeight={700}
              color={s.total_defects_found > 0 ? "error.main" : "success.main"}
            >
              {s.total_defects_found}
            </Typography>
          </MetaChip>
          <MetaChip>
            <Typography variant="caption" color="textSecondary">
              Avg Quality Score
            </Typography>
            <Typography variant="body1" fontWeight={700}>
              {geminiDisabled ? "—" : `${avgScore}/100`}
            </Typography>
          </MetaChip>
          <MetaChip>
            <Typography variant="caption" color="textSecondary">
              Pass / Review / Fail
            </Typography>
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
                <Chip
                  key={i}
                  label={`${d.defect_type}: ${d.count} (${Math.round(d.avg_confidence * 100)}% avg confidence)`}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
      </SectionCard>

      <PaginationControls /> 

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

      {page === 0 && (
        <>
          {/* Compile chart */}
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
        </>
      )}

      {/* Current Pair */}
      {currentPair && (
        <SectionCard elevation={3}>
          <SectionTitle>
            Pair {page + 1} of {per_pair_results.length}
          </SectionTitle>

          <PairSection
            pair={currentPair}
            index={page}
            onImageClick={setLightboxImg}
          />
        </SectionCard>
      )}

   <PaginationControls />
    </ContentBox>
  );
}
