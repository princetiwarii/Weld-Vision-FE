import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  Box,
  Card,
  CircularProgress,
  IconButton,
  Typography,
  Grid,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { BASE_URL } from "app/config";

const ContentBox = styled("div")(({ theme }) => ({
  margin: "2rem",
  [theme.breakpoints.down("sm")]: { margin: "1rem" },
}));

const SectionCard = styled(Card)(({ theme }) => ({
  padding: "1.5rem",
  marginBottom: "1.5rem",
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.85rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.09em",
  color: theme.palette.text.secondary,
  marginBottom: "1rem",
  borderBottom: `1px solid ${theme.palette.divider}`,
  paddingBottom: "0.5rem",
}));

const FullImg = styled("img")(() => ({
  width: "100%",
  borderRadius: 8,
  display: "block",
  objectFit: "cover",
  cursor: "zoom-in",
  transition: "opacity 0.15s ease",
  border: "1px solid rgba(0,0,0,0.08)",
  "&:hover": { opacity: 0.88 },
}));

export default function ObjectManualResultsPage() {
  const { objectId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState("");
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/v1/inspections/sessions/object/${objectId}/manual-results`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch object manual results:", err);
        setError("Could not load data for this object.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [objectId]);

  // Lightbox Handlers
  const handleImageClick = (src) => {
    if (!src) return;
    setLightboxSrc(src);
    setLightboxOpen(true);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxSrc("");
  };

  const zoomIn = (e) => {
    e.stopPropagation();
    setScale((s) => Math.min(s + 0.5, 4));
  };

  const zoomOut = (e) => {
    e.stopPropagation();
    setScale((s) => Math.max(s - 0.5, 1));
    if (scale - 0.5 <= 1) setPosition({ x: 0, y: 0 });
  };

  const resetZoom = (e) => {
    e.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (lightboxOpen) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [lightboxOpen, handleMouseMove]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <ContentBox>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Box mt={2}>
          <IconButton onClick={() => navigate("/logs")}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="body2" display="inline">Back to Logs</Typography>
        </Box>
      </ContentBox>
    );
  }

  // Extract all images and charts from the sessions
  const sessions = data.sessions || [];
  const stitchedImages = [];
  const annotatedImages = [];
  const charts = [];

  sessions.forEach((s) => {
    const chartUrl = s.compile_chart_url || (s.session && s.session.compile_chart_url);
    if (chartUrl && !charts.includes(chartUrl)) {
      charts.push(chartUrl);
    }
    const results = s.per_pair_results || s.per_image_results || [];
    results.forEach((item) => {
      const stitchedUrl = item.original_image_url || item.stitched_image_url;
      const annotatedUrl = item.annotated_image_url;
      if (stitchedUrl) stitchedImages.push({ url: stitchedUrl, label: item.image_label || item.source_frame_a_label });
      if (annotatedUrl) annotatedImages.push({ url: annotatedUrl, label: item.image_label || item.source_frame_a_label });
    });
  });

  return (
    <ContentBox>
      {/* ─── HEADER ─── */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate("/logs")} sx={{ mr: 1, bgcolor: "background.paper" }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h5" fontWeight="700">
            Object Inspection: {objectId}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Found {sessions.length} session(s) with {stitchedImages.length} images
          </Typography>
        </Box>
      </Box>

      {/* ─── STITCHED IMAGES ─── */}
      <SectionCard>
        <SectionTitle>1. Stitched / Original Images</SectionTitle>
        {stitchedImages.length === 0 ? (
          <Typography variant="body2" color="textSecondary">No original images found.</Typography>
        ) : (
          <Grid container spacing={2}>
            {stitchedImages.map((img, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <FullImg src={img.url} onClick={() => handleImageClick(img.url)} alt={`Stitched ${i}`} />
                <Typography variant="caption" color="textSecondary" display="block" mt={0.5} align="center">
                  {img.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        )}
      </SectionCard>

      {/* ─── ANNOTATED IMAGES ─── */}
      <SectionCard>
        <SectionTitle>2. AI Labeled / Annotated Images</SectionTitle>
        {annotatedImages.length === 0 ? (
          <Typography variant="body2" color="textSecondary">No annotated images found.</Typography>
        ) : (
          <Grid container spacing={2}>
            {annotatedImages.map((img, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <FullImg src={img.url} onClick={() => handleImageClick(img.url)} alt={`Annotated ${i}`} />
                <Typography variant="caption" color="textSecondary" display="block" mt={0.5} align="center">
                  {img.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        )}
      </SectionCard>

      {/* ─── COMPILE CHARTS ─── */}
      <SectionCard>
        <SectionTitle>3. Compile Charts</SectionTitle>
        {charts.length === 0 ? (
          <Typography variant="body2" color="textSecondary">No charts found.</Typography>
        ) : (
          <Grid container spacing={2} justifyContent="center">
            {charts.map((chartUrl, i) => (
              <Grid item xs={12} md={8} key={i}>
                <FullImg src={chartUrl} onClick={() => handleImageClick(chartUrl)} alt={`Chart ${i}`} />
              </Grid>
            ))}
          </Grid>
        )}
      </SectionCard>

      {/* ─── LIGHTBOX (Zoom) ─── */}
      {lightboxOpen && (
        <Box
          onClick={closeLightbox}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            bgcolor: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            backdropFilter: "blur(4px)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 24,
              right: 24,
              display: "flex",
              gap: 2,
              zIndex: 10000,
            }}
          >
            <IconButton onClick={zoomIn} sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff", "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}>
              <ZoomInIcon />
            </IconButton>
            <IconButton onClick={zoomOut} sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff", "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}>
              <ZoomOutIcon />
            </IconButton>
            <IconButton onClick={resetZoom} sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff", "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}>
              <RestartAltIcon />
            </IconButton>
          </Box>
          <img
            ref={imgRef}
            src={lightboxSrc}
            alt="Expanded view"
            onMouseDown={handleMouseDown}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxHeight: "90vh",
              maxWidth: "90vw",
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? "none" : "transform 0.2s ease",
              cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
              boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
              borderRadius: "4px",
            }}
            draggable={false}
          />
        </Box>
      )}
    </ContentBox>
  );
}
