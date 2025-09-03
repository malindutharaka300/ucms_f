import React from "react";
import {
  Box, Paper, Toolbar, Typography, Button, Table, TableHead, TableRow, TableCell,
  TableBody, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, InputLabel, FormControl, Snackbar, Alert, Stack,
  CircularProgress, Chip, Card, CardContent, Divider
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import api from "../../api";

const GRADES = ["A+", "A", "B+", "B", "C+", "C", "D", "F"];

export default function ResultPage() {
  const [rows, setRows] = React.useState([]);
  const [courses, setCourses] = React.useState([]);
  const [students, setStudents] = React.useState([]);
  const [me, setMe] = React.useState(null);

  const [loading, setLoading] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isEdit, setIsEdit] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [viewRow, setViewRow] = React.useState(null);

  const [form, setForm] = React.useState({
    course_id: "",
    user_id: "",
    test_no: "",
    grade: "",
  });

  const [toast, setToast] = React.useState({ open: false, message: "", severity: "success" });
  const openToast = (m, s="success") => setToast({ open: true, message: m, severity: s });
  const closeToast = () => setToast(p => ({ ...p, open: false }));

  const fetchAll = async () => {
    setLoading(true);
    try {
      const meRes = await api.get("/user");
      setMe(meRes.data);

      const [opts, list] = await Promise.all([
        api.get("/results/options"),
        api.get("/results"),
      ]);
      setCourses(opts.data.courses || []);
      setStudents(opts.data.students || []);
      setRows(Array.isArray(list.data) ? list.data : []);
    } catch (e) {
      openToast(e?.response?.data?.message || e?.response?.data?.error || "Failed to load", "error");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchAll(); }, []);

  const resetForm = () => {
    setForm({
      course_id: "",
      user_id: me?.role === "admin" ? "" : me?.id || "",
      test_no: "",
      grade: "",
    });
    setIsEdit(false);
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    setIsEdit(true);
    setEditingId(row.id);
    setForm({
      course_id: row.course_id ?? row.course?.id ?? "",
      user_id: row.user_id ?? row.user?.id ?? "",
      test_no: row.test_no ?? "",
      grade: row.grade ?? "",
    });
    setDialogOpen(true);
  };

  const openView = async (row) => {
    try {
      const { data } = await api.get(`/results/show/${row.id}`);
      setViewRow(data);
      setViewOpen(true);
    } catch (e) {
      openToast("Failed to load result", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      if (!form.course_id || !form.user_id || !form.test_no || !form.grade) {
        openToast("Fill all fields", "error");
        return;
      }
      if (isEdit && editingId) {
        await api.put(`/results/update/${editingId}`, {
          course_id: Number(form.course_id),
          user_id: Number(form.user_id),
          test_no: Number(form.test_no),
          grade: form.grade,
        });
        openToast("Result updated");
      } else {
        await api.post("/results/store", {
          course_id: Number(form.course_id),
          user_id: Number(form.user_id),
          test_no: Number(form.test_no),
          grade: form.grade,
        });
        openToast("Result created");
      }
      setDialogOpen(false);
      fetchAll();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || "Operation failed";
      openToast(msg, "error");
    }
  };

  const removeRow = async (id) => {
    if (!confirm("Delete this result?")) return;
    try {
      await api.delete(`/results/delete/${id}`);
      openToast("Result deleted");
      fetchAll();
    } catch {
      openToast("Delete failed", "error");
    }
  };

  const gradeChipColor = (g) => {
    if (g?.startsWith("A")) return "success";
    if (g?.startsWith("B")) return "primary";
    if (g?.startsWith("C")) return "warning";
    if (g?.startsWith("D")) return "warning";
    return "error";
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Toolbar sx={{ px: 0 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Results</Typography>
          {me?.role === "admin" && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              New Result
            </Button>
          )}
        </Toolbar>
      </Paper>

      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display:"flex", justifyContent:"center", py:6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Course</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Test #</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">No results yet.</TableCell>
                </TableRow>
              )}
              {rows.map(r => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.course?.name || `#${r.course_id}`}</TableCell>
                  <TableCell>{r.user?.name || `#${r.user_id}`}</TableCell>
                  <TableCell>{r.test_no}</TableCell>
                  <TableCell>
                    <Chip label={r.grade} color={gradeChipColor(r.grade)} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton onClick={() => openView(r)}><VisibilityIcon /></IconButton>
                      {me?.role === "admin" && (
                        <>
                          <IconButton onClick={() => openEdit(r)}><EditIcon /></IconButton>
                          <IconButton color="error" onClick={() => removeRow(r.id)}><DeleteIcon /></IconButton>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm" keepMounted>
        <DialogTitle>{isEdit ? "Edit Result" : "New Result"}</DialogTitle>
        <form onSubmit={submitForm}>
          <DialogContent dividers>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="course-label">Course</InputLabel>
                <Select
                  labelId="course-label"
                  label="Course"
                  name="course_id"
                  value={form.course_id}
                  onChange={handleChange}
                >
                  {courses.map(c => (
                    <MenuItem key={c.id} value={c.id}>{c.name} ({c.code})</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth disabled={me?.role !== "admin"}>
                <InputLabel id="student-label">Student</InputLabel>
                <Select
                  labelId="student-label"
                  label="Student"
                  name="user_id"
                  value={form.user_id}
                  onChange={handleChange}
                >
                  {students.map(s => (
                    <MenuItem key={s.id} value={s.id}>{s.name} — {s.email}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Test Number"
                type="number"
                name="test_no"
                value={form.test_no}
                onChange={handleChange}
                inputProps={{ min: 1 }}
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel id="grade-label">Grade</InputLabel>
                <Select
                  labelId="grade-label"
                  label="Grade"
                  name="grade"
                  value={form.grade}
                  onChange={handleChange}
                >
                  {GRADES.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">{isEdit ? "Save" : "Create"}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View dialog (pretty view) */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Result</DialogTitle>
        <DialogContent dividers>
          {viewRow && (
            <Card elevation={0}>
              <CardContent>
                <Typography variant="h6">{viewRow.course?.name} <Typography component="span" variant="body2" color="text.secondary">({viewRow.course?.code})</Typography></Typography>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  {viewRow.user?.name} — {viewRow.user?.email}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="overline" color="text.secondary">Test</Typography>
                    <Typography variant="h5">#{viewRow.test_no}</Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="overline" color="text.secondary">Grade</Typography>
                    <Typography variant="h3" fontWeight={700}>{viewRow.grade}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={closeToast}>
        <Alert onClose={closeToast} severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
