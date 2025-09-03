import React from "react";
import {
  Box,
  Paper,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FolderCopyIcon from "@mui/icons-material/FolderCopy";
import api from "../../api";
import { APP_URL } from "../../api";
import { useNavigate } from "react-router-dom";

function Course() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isEdit, setIsEdit] = React.useState(false);
  const [contentId, setContentId] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const navigate = useNavigate();

  const [form, setForm] = React.useState({
    name: "",
    code: "",
    status: "1",
    image: null,
  });
  const [imagePreview, setImagePreview] = React.useState(null);

  const [deleteId, setDeleteId] = React.useState(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [me, setMe] = React.useState(null);

  const [toast, setToast] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  const openToast = (message, severity = "success") =>
    setToast({ open: true, message, severity });

  const closeToast = () => setToast((p) => ({ ...p, open: false }));

  const resetForm = () => {
    setForm({ name: "", code: "", status: "active", image: null });
    setImagePreview(null);
    setIsEdit(false);
    setEditingId(null);
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/courses");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      openToast("Failed to load courses", "error");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCourses();
    api
      .get("/user")
      .then((res) => {
        setMe(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      })
      .catch(() => {
        // token invalid/expired
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/", { replace: true });
      });
  }, []);

  const handleOpenCreate = () => {
    resetForm();
    setIsEdit(false);
    setDialogOpen(true);
  };

  const handleOpenEdit = (course) => {
    setIsEdit(true);
    setEditingId(course.id);
    setForm({
      name: course.name || "",
      code: course.code || "",
      status: course.status || 1,
      image: null,
    });
    // Show current image if any
    setImagePreview(course.image ? `${APP_URL}/${course.image}` : null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files?.[0] || null;
      setForm((p) => ({ ...p, image: file }));
      setImagePreview(file ? URL.createObjectURL(file) : null);
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Build FormData (supports file)
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("code", form.code);
    fd.append("status", Number(form.status));
    if (form.image) fd.append("image", form.image);

    try {
      if (isEdit && editingId) {
        // PUT with FormData: use method override for simplicity
        fd.append("_method", "PUT");
        await api.post(`/courses/update/${editingId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        openToast("Course updated");
      } else {
        await api.post("/courses/store", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        openToast("Course created");
      }
      handleCloseDialog();
      fetchCourses();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Operation failed";
      openToast(msg, "error");
    }
  };

  const askDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const opneContent = (courseId) => {
    navigate(`/dashboard/content/${courseId}`);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/courses/delete/${deleteId}`);
      openToast("Course deleted");
      setConfirmOpen(false);
      setDeleteId(null);
      fetchCourses();
    } catch (err) {
      openToast("Delete failed", "error");
    }
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setDeleteId(null);
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Toolbar sx={{ px: 0 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Courses
            {/* {me ? `${me.role}` : ""} */}
          </Typography>
          {me?.role === "admin" && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
            >
              New Course
            </Button>
          )}
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
                <TableCell width={72}>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Code</TableCell>
                {me?.role === "admin" && (
                  <>
                    <TableCell>Status</TableCell>
                  </>
                )}
                <TableCell align="right" width={140}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No courses found.
                  </TableCell>
                </TableRow>
              )}

              {rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Avatar
                      variant="rounded"
                      src={row.image ? `${APP_URL}/${row.image}` : undefined}
                      alt={row.name}
                      sx={{ width: 48, height: 48 }}
                    >
                      {row.name?.[0] || "C"}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>{row.name}</Typography>
                  </TableCell>
                  <TableCell>{row.code}</TableCell>
                  {me?.role === "admin" && (
                    <>
                      <TableCell>
                        <Chip
                          label={row.status === 1 ? "Active" : "Inactive"}
                          color={row.status === 1 ? "success" : "default"}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </>
                  )}
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      {me?.role === "admin" && (
                        <>
                          <Tooltip title="Edit">
                            <IconButton onClick={() => handleOpenEdit(row)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              onClick={() => askDelete(row.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title="Content">
                        <IconButton
                          color="danger"
                          onClick={() => opneContent(row.id)}
                        >
                          <FolderCopyIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{isEdit ? "Edit Course" : "New Course"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Code"
              name="code"
              value={form.code}
              onChange={handleChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <MenuItem value={1}>Active</MenuItem>
                <MenuItem value={0}>Inactive</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2} alignItems="center">
              <Button variant="outlined" component="label">
                {isEdit ? "Change Image" : "Upload Image"}
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  name="image"
                  onChange={handleChange}
                />
              </Button>
              {imagePreview && (
                <Avatar
                  variant="rounded"
                  src={imagePreview}
                  sx={{ width: 64, height: 64 }}
                />
              )}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {isEdit ? "Save Changes" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={confirmOpen} onClose={handleCancelDelete}>
        <DialogTitle>Delete this course?</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={closeToast}>
        <Alert onClose={closeToast} severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Course;
