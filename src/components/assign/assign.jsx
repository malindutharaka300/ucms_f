import React from "react";
import {
  Box, Paper, Toolbar, Typography, Button, Table, TableHead, TableRow, TableCell,
  TableBody, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, InputLabel, FormControl, Snackbar, Alert, Stack,
  CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../api";

export default function Assign() {
  const [rows, setRows] = React.useState([]);
  const [courses, setCourses] = React.useState([]);
  const [students, setStudents] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isEdit, setIsEdit] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);

  const [form, setForm] = React.useState({
    course_id: "",
    user_id: "",
    date: "",
  });

  const [toast, setToast] = React.useState({ open: false, message: "", severity: "success" });
  const openToast = (m, s="success") => setToast({ open: true, message: m, severity: s });
  const closeToast = () => setToast(p => ({ ...p, open: false }));

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [opts, list] = await Promise.all([
        api.get("/assigns/options"),
        api.get("/assigns"),
      ]);
      setCourses(opts.data.courses || []);
      setStudents(opts.data.students || []);
      setRows(Array.isArray(list.data) ? list.data : []);
    } catch (e) {
      openToast(e?.response?.data?.error || "Failed to load", "error");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchAll(); }, []);

  const resetForm = () => {
    setForm({ course_id: "", user_id: "", date: "" });
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
      date: row.date ?? "",
    });
    setDialogOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      if (!form.course_id || !form.user_id) {
        openToast("Select course and student", "error");
        return;
      }
      if (isEdit && editingId) {
        await api.put(`/assigns/update/${editingId}`, form);
        openToast("Assignment updated");
      } else {
        await api.post("/assigns/store", form);
        openToast("Assigned");
      }
      setDialogOpen(false);
      fetchAll();
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || "Operation failed";
      openToast(msg, "error");
    }
  };

  const removeRow = async (id) => {
    if (!confirm("Delete this assignment?")) return;
    try {
      await api.delete(`/assigns/delete/${id}`);
      openToast("Assignment deleted");
      fetchAll();
    } catch (err) {
      openToast("Delete failed", "error");
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Toolbar sx={{ px: 0 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Assign Course to Student</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            New Assignment
          </Button>
        </Toolbar>
      </Paper>

      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Course</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">No assignments yet.</TableCell>
                </TableRow>
              )}
              {rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.course?.name || `#${r.course_id}`}</TableCell>
                  <TableCell>{r.user?.name || `#${r.user_id}`}</TableCell>
                  <TableCell>{r.date || "-"}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton onClick={() => openEdit(r)}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => removeRow(r.id)}><DeleteIcon /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm" keepMounted>
        <DialogTitle>{isEdit ? "Edit Assignment" : "New Assignment"}</DialogTitle>
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
                  {courses.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name} ({c.code})</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="student-label">Student</InputLabel>
                <Select
                  labelId="student-label"
                  label="Student"
                  name="user_id"
                  value={form.user_id}
                  onChange={handleChange}
                >
                  {students.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.name} — {s.email}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Date"
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">{isEdit ? "Save" : "Assign"}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={closeToast}>
        <Alert onClose={closeToast} severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
