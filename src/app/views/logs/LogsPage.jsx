// src/app/views/logs/LogsPage.jsx

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  Box,
  Card,
  Chip,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Alert,
  Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { BASE_URL } from "app/config";

// ─── Styled ────────────────────────────────────────────────
const ContentBox = styled("div")(({ theme }) => ({
  margin: "2rem",
  [theme.breakpoints.down("sm")]: { margin: "1rem" },
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": { backgroundColor: theme.palette.action.hover },
}));

const StyledTable = styled(Table)(() => ({
  "& .MuiTableCell-root": {
    paddingLeft: "12px",
    paddingRight: "12px",
    paddingTop: "12px",
    paddingBottom: "12px",
    whiteSpace: "nowrap",
  },
  "& .MuiTableCell-head": {
    paddingTop: "12px",
    paddingBottom: "12px",
  },
}));

const ViewLink = styled("span")(({ theme }) => ({
  color: theme.palette.primary.main,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "50%",
  padding: "4px",
  transition: "background 0.15s",
  "&:hover": { backgroundColor: theme.palette.action.hover },
}));

const ComplianceDot = styled("span")(({ pass }) => ({
  display: "inline-block",
  width: 9,
  height: 9,
  borderRadius: "50%",
  backgroundColor: pass === "true" ? "#4caf50" : "#f44336",
  flexShrink: 0,
}));

// ─── Helpers ───────────────────────────────────────────────
function scoreChipColor(score) {
  if (score >= 85) return "success";
  if (score >= 60) return "warning";
  return "error";
}

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Component ─────────────────────────────────────────────
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function LogsPage() {
  const navigate = useNavigate();

  const [allSessions, setAllSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${BASE_URL}/api/v1/inspections/sessions?limit=100`,
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setAllSessions(data.sessions || []);
    } catch (err) {
      setError(err.message || "Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, pageSize]);

  const filtered = allSessions.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      s.object_id?.toLowerCase().includes(q) ||
      s.object_name?.toLowerCase().includes(q) ||
      s.scan_number?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <ContentBox>
      {/* ── Header ── */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h6" fontWeight={600}>
          Inspection Logs
          {!loading && (
            <Typography
              component="span"
              variant="caption"
              color="textSecondary"
              ml={1}
            >
              ({filtered.length} session{filtered.length !== 1 ? "s" : ""})
            </Typography>
          )}
        </Typography>
        <Button
          size="small"
          startIcon={<RefreshIcon />}
          onClick={fetchSessions}
        >
          Refresh
        </Button>
      </Box>

      {/* ── Search + Filters row ── */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={2.5}>
        <TextField
          size="small"
          placeholder="Search by Object ID, Name, or Scan No."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Per Page</InputLabel>
          <Select
            value={pageSize}
            label="Per Page"
            onChange={(e) => setPageSize(e.target.value)}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <MenuItem key={n} value={n}>
                {n} / page
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* ── Error ── */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* ── Loading ── */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Alert severity="info">
          {allSessions.length === 0
            ? "No inspection sessions found. Submit your first inspection!"
            : "No sessions match your search or filter."}
        </Alert>
      ) : (
        <>
          <Card elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
            <TableContainer>
              <StyledTable>
                <StyledTableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Object ID</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Scan</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Date</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Frames</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Defects</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Score</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>AWS / ISO</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Status</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Action</strong>
                    </TableCell>
                  </TableRow>
                </StyledTableHead>

                <TableBody>
                  {paginated.map((s) => (
                    <StyledTableRow key={s.session_id}>
                      {/* Object — name + ID only */}
                      <TableCell sx={{ maxWidth: 160 }}>
                        <Tooltip
                          title={`Object ID: ${s.object_id}${s.side ? ` · Side: ${s.side}` : ""}`}
                          arrow
                          placement="top"
                        >
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: 150,
                              cursor: "pointer",
                              color: "primary.main",
                              textDecoration: "underline",
                              "&:hover": { color: "primary.dark" }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/logs/object/${s.object_id}`);
                            }}
                          >
                            {s.object_id}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      {/* Scan — slim, just # and side */}
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          #{s.scan_number || "—"}
                        </Typography>
                        {s.side && (
                          <Typography variant="caption" color="textSecondary">
                            {s.side}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          {formatDate(s.created_at)}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="body2">
                          {s.frames_extracted}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={
                            s.total_defects_found === 0
                              ? "None"
                              : s.total_defects_found
                          }
                          color={
                            s.total_defects_found === 0 ? "success" : "error"
                          }
                          size="small"
                        />
                      </TableCell>

                      {/* Score — number only */}
                      <TableCell align="center">
                        <Chip
                          label={
                            s.avg_quality_score > 0
                              ? `${s.avg_quality_score}`
                              : "—"
                          }
                          color={
                            s.avg_quality_score > 0
                              ? scoreChipColor(s.avg_quality_score)
                              : "default"
                          }
                          size="small"
                        />
                      </TableCell>

                      {/* AWS / ISO — dots + labels with tooltips */}
                      <TableCell align="center">
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          gap={1}
                        >
                          <Tooltip
                            title={`AWS: ${s.overall_compliance_aws ? "Pass" : "Fail"}`}
                            arrow
                          >
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={0.5}
                              sx={{ cursor: "default" }}
                            >
                              <ComplianceDot
                                pass={String(s.overall_compliance_aws)}
                              />
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                AWS
                              </Typography>
                            </Box>
                          </Tooltip>
                          <Tooltip
                            title={`ISO: ${s.overall_compliance_iso ? "Pass" : "Fail"}`}
                            arrow
                          >
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={0.5}
                              sx={{ cursor: "default" }}
                            >
                              <ComplianceDot
                                pass={String(s.overall_compliance_iso)}
                              />
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                ISO
                              </Typography>
                            </Box>
                          </Tooltip>
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={s.status}
                          color={
                            s.status === "completed"
                              ? "success"
                              : s.status === "processing"
                                ? "warning"
                                : "error"
                          }
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Tooltip title="View full analysis" arrow>
                          <ViewLink
                            onClick={() => navigate(`/logs/${s.session_id}`)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </ViewLink>
                        </Tooltip>
                      </TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </StyledTable>
            </TableContainer>
          </Card>

          {/* ── Pagination ── */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={2}
            mt={2.5}
          >
            <Typography variant="caption" color="textSecondary">
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, filtered.length)} of {filtered.length}{" "}
              sessions
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, val) => setPage(val)}
              color="primary"
              shape="rounded"
              showFirstButton
              showLastButton
            />
          </Box>
        </>
      )}
    </ContentBox>
  );
}
