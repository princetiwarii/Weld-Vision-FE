// src/app/views/dashboard/WeldInspection.jsx

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  Alert, Box, Button, Card, Chip, CircularProgress,
  Grid, MenuItem, TextField, Tooltip, Typography
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import HistoryIcon from "@mui/icons-material/History";
import ReplayIcon from "@mui/icons-material/Replay";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import { BASE_URL } from "app/config";

// ─── Constants ─────────────────────────────────────────────
const WELDING_TYPES = ["Fillet Weld", "Butt Weld", "Lap Weld", "Corner Weld", "Edge Weld", "T-Joint Weld"];
const WELDING_POSITIONS = ["Flat", "Horizontal", "Vertical", "Overhead"];
const SIDES = ["Top", "Bottom", "Left", "Right", "Front", "Back"];

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

const DropZone = styled(Box)(({ theme, isDragging }) => ({
  border: `2px dashed ${isDragging ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: 12,
  padding: "2.5rem 1.5rem",
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.2s ease",
  backgroundColor: isDragging ? theme.palette.action.focus : theme.palette.action.hover,
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.focus
  }
}));

const ThumbGrid = styled(Box)(() => ({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem",
  marginTop: "1rem"
}));

const ThumbBox = styled(Box)(({ theme }) => ({
  position: "relative",
  width: 80, height: 80,
  borderRadius: 8,
  overflow: "hidden",
  border: `1px solid ${theme.palette.divider}`,
  "& img": { width: "100%", height: "100%", objectFit: "cover" },
  "& .del": {
    position: "absolute", top: 2, right: 2,
    background: "rgba(0,0,0,0.55)", borderRadius: "50%",
    padding: 2, cursor: "pointer", display: "none"
  },
  "&:hover .del": { display: "flex" }
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

function ComplianceBadge({ label, pass }) {
  return (
    <Chip
      label={`${label}: ${pass ? "✓ Pass" : "✗ Fail"}`}
      color={pass ? "success" : "error"}
      size="small" variant="outlined" sx={{ mr: 1 }}
    />
  );
}

// ─── Main Component ─────────────────────────────────────────
export default function WeldInspection() {
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [form, setForm] = useState({
    object_id: "",
    object_name: "",
    scan_number: "",
    side: "",
    welding_type: "",
    welding_position: "",
    segment_length_cm: "",
    remarks: ""
  });

  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);

  const handleField = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const addFiles = (files) => {
    const valid = Array.from(files).filter((f) =>
      ["image/jpeg", "image/png", "image/webp", "image/bmp"].includes(f.type)
    );
    if (images.length + valid.length > 50) {
      setErrorMsg("Maximum 50 images allowed.");
      return;
    }
    setImages((p) => [...p, ...valid.map((f) => ({ file: f, previewUrl: URL.createObjectURL(f) }))]);
    setErrorMsg("");
  };

  const removeImage = (idx) => {
    setImages((p) => {
      URL.revokeObjectURL(p[idx].previewUrl);
      return p.filter((_, i) => i !== idx);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (!form.object_id.trim()) { setErrorMsg("Object ID is required."); return; }
    if (images.length === 0) { setErrorMsg("Please upload at least one image."); return; }

    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined) formData.append(k, v);
    });
    images.forEach(({ file }, i) => formData.append("images", file, `frame${i + 1}.jpg`));

    try {
      const res = await fetch(`${BASE_URL}/api/v1/inspections/images`, {
        method: "POST",
        body: formData
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Server error: ${res.status}`);
      }
      setResult(await res.json());
      setStatus("success");
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const handleReset = () => {
    images.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
    setImages([]);
    setForm({
      object_id: "", object_name: "", scan_number: "", side: "",
      welding_type: "", welding_position: "", segment_length_cm: "", remarks: ""
    });
    setResult(null);
    setStatus("idle");
    setErrorMsg("");
  };

  // ════════════════════════════════════════
  //  RESULTS VIEW
  // ════════════════════════════════════════
  if (status === "success" && result) {
    const stats = result.statistical_summary;
    const avgScore = stats.average_quality_score ?? stats.avg_quality_score ?? 0;
    const geminiDisabled = avgScore === 0 && stats.pass_count === 0 && stats.fail_count === 0;

    return (
      <ContentBox>

        {/* ── Header ── */}
        <Box display="flex" alignItems="flex-start" justifyContent="space-between"
          mb={3} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Inspection Results — {result.object_name || result.object_id}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Session ID: {result.session_id}
            </Typography>
          </Box>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button variant="outlined" size="small"
              startIcon={<ReplayIcon />} onClick={handleReset}>
              New Inspection
            </Button>
            <Button variant="contained" size="small"
              startIcon={<HistoryIcon />} onClick={() => navigate("/logs")}>
              View All Logs
            </Button>
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
          <Box display="flex" flexWrap="wrap" mb={1}>
            <MetaChip>
              <Typography variant="caption" color="textSecondary">Images Analyzed</Typography>
              <Typography variant="body1" fontWeight={700}>{stats.total_images_analyzed}</Typography>
            </MetaChip>
            <MetaChip>
              <Typography variant="caption" color="textSecondary">Defects Found</Typography>
              <Typography variant="body1" fontWeight={700}
                color={result.total_defects_found > 0 ? "error.main" : "success.main"}>
                {result.total_defects_found}
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
            <MetaChip>
              <Typography variant="caption" color="textSecondary">Processing Time</Typography>
              <Typography variant="body1" fontWeight={700}>{result.processing_time_seconds}s</Typography>
            </MetaChip>
          </Box>
          <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
            <ComplianceBadge label="AWS" pass={result.overall_compliance_aws} />
            <ComplianceBadge label="ISO" pass={result.overall_compliance_iso} />
          </Box>
        </SectionCard>

        {/* ── Compile chart ── */}
        {result.compile_chart_url && (
          <SectionCard elevation={3}>
            <SectionTitle>Compile Chart — Full Session Overview</SectionTitle>
            <img src={result.compile_chart_url} alt="Compile chart"
              style={{ width: "100%", borderRadius: 8, display: "block" }} />
          </SectionCard>
        )}

        {/* ── Image grid ── */}
        <SectionCard elevation={3}>
          <SectionTitle>
            Analyzed Images ({result.per_image_results.length})
            <Typography component="span" variant="caption" color="textSecondary" ml={1}>
              — click any image to view full details
            </Typography>
          </SectionTitle>

          <Grid container spacing={2}>
            {result.per_image_results.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.image_index}>
                <ImageCard
                  elevation={2}
                  onClick={() => navigate(`/logs/${result.session_id}/frame/${item.image_label}`)}
                >
                  {item.annotated_image_url || item.original_image_url ? (
                    <StitchedImg src={item.annotated_image_url || item.original_image_url} alt={item.image_label} />
                  ) : (
                    <ImgPlaceholder>
                      <ImageSearchIcon sx={{ fontSize: 40 }} />
                    </ImgPlaceholder>
                  )}

                  <Box px={1.5} py={1}>
                    <Box display="flex" alignItems="center"
                      justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2" fontWeight={700}>
                        {item.image_label}
                      </Typography>
                      <Chip
                        label={
                          item.overall_result === "review" && item.weld_quality_score === 0
                            ? "Pending" : item.overall_result.toUpperCase()
                        }
                        color={resultColor(item.overall_result)}
                        size="small"
                      />
                    </Box>

                    {item.weld_quality_score > 0 && (
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Score: {item.weld_quality_score}/100
                        </Typography>
                        <Box sx={{
                          mt: 0.5, height: 5, borderRadius: 3,
                          backgroundColor: "action.hover", overflow: "hidden"
                        }}>
                          <Box sx={{
                            height: "100%",
                            width: `${item.weld_quality_score}%`,
                            backgroundColor: scoreBarColor(item.weld_quality_score),
                            borderRadius: 3
                          }} />
                        </Box>
                      </Box>
                    )}

                    <Typography variant="caption" color="textSecondary"
                      display="block" mt={0.5}>
                      {item.defects?.length > 0
                        ? `${item.defects.length} defect${item.defects.length > 1 ? "s" : ""} found`
                        : item.weld_quality_score > 0 ? "No defects" : ""}
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

  // ════════════════════════════════════════
  //  UPLOAD / FORM VIEW
  // ════════════════════════════════════════
  return (
    <ContentBox>
      <Typography variant="h6" fontWeight={600} mb={3}>
        New Weld Inspection
      </Typography>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMsg("")}>
          {errorMsg}
        </Alert>
      )}

      {/* ── Form ── */}
      <SectionCard elevation={3}>
        <SectionTitle>Inspection Details</SectionTitle>
        <Grid container spacing={2}>

          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth size="small" label="Object ID *"
              name="object_id" value={form.object_id} onChange={handleField}
              helperText='e.g. "A", "DOOR-01" — auto uppercased' />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth size="small" label="Object Name"
              name="object_name" value={form.object_name} onChange={handleField}
              helperText='e.g. "Pipe Joint A"' />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth size="small" label="Scan Number"
              name="scan_number" value={form.scan_number} onChange={handleField}
              helperText='e.g. "1", "2"' />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth size="small" select label="Side"
              name="side" value={form.side} onChange={handleField}>
              <MenuItem value=""><em>None</em></MenuItem>
              {SIDES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth size="small" select label="Welding Type"
              name="welding_type" value={form.welding_type} onChange={handleField}>
              <MenuItem value=""><em>None</em></MenuItem>
              {WELDING_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth size="small" select label="Welding Position"
              name="welding_position" value={form.welding_position} onChange={handleField}>
              <MenuItem value=""><em>None</em></MenuItem>
              {WELDING_POSITIONS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth size="small" label="Segment Length (cm)"
              name="segment_length_cm" value={form.segment_length_cm}
              onChange={handleField} type="number"
              helperText="Physical length of each image in cm (for scale bar)" />
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Remarks"
              name="remarks" value={form.remarks} onChange={handleField}
              multiline rows={2} placeholder="Any notes about this inspection..." />
          </Grid>

        </Grid>
      </SectionCard>

      {/* ── Upload ── */}
      <SectionCard elevation={3}>
        <SectionTitle>
          Upload Weld Frame Images
          <Typography component="span" variant="caption" color="textSecondary" ml={1}>
            (JPEG / PNG / WebP / BMP · max 20MB each · max 50 images)
          </Typography>
        </SectionTitle>

        <DropZone
          isDragging={isDragging ? 1 : 0}
          onClick={() => fileInputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
          <Typography variant="body2" fontWeight={600}>
            Drag & drop frames here, or click to browse
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Upload frames in order — they will be paired consecutively (1&2, 3&4…)
          </Typography>
          <input ref={fileInputRef} type="file" hidden multiple
            accept="image/jpeg,image/png,image/webp,image/bmp"
            onChange={(e) => addFiles(e.target.files)} />
        </DropZone>

        {images.length > 0 && (
          <>
            <Box display="flex" alignItems="center" justifyContent="space-between" mt={2} mb={0.5}>
              <Typography variant="body2" fontWeight={600}>
                {images.length} frame{images.length > 1 ? "s" : ""} selected
              </Typography>
              <Button size="small" color="error" onClick={() => {
                images.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
                setImages([]);
              }}>Clear all</Button>
            </Box>
            <ThumbGrid>
              {images.map(({ previewUrl }, i) => (
                <ThumbBox key={i}>
                  <img src={previewUrl} alt={`frame-${i + 1}`} />
                  <Box className="del" onClick={() => removeImage(i)}>
                    <DeleteOutlineIcon sx={{ fontSize: 16, color: "#fff" }} />
                  </Box>
                  <Box sx={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    background: "rgba(0,0,0,0.5)", textAlign: "center"
                  }}>
                    <Typography sx={{ fontSize: "0.6rem", color: "#fff" }}>#{i + 1}</Typography>
                  </Box>
                </ThumbBox>
              ))}
            </ThumbGrid>
          </>
        )}
      </SectionCard>

      {/* ── Submit ── */}
      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button variant="outlined" onClick={() => navigate("/logs")}
          startIcon={<HistoryIcon />}>
          View Logs
        </Button>
        <Button variant="contained" onClick={handleSubmit}
          disabled={status === "loading"}
          startIcon={status === "loading"
            ? <CircularProgress size={16} color="inherit" />
            : <CloudUploadIcon />}
          sx={{ minWidth: 180 }}>
          {status === "loading" ? "Analyzing…" : "Submit for Analysis"}
        </Button>
      </Box>

      {status === "loading" && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Uploading frames and running analysis — this may take a few seconds…
        </Alert>
      )}
    </ContentBox>
  );
}