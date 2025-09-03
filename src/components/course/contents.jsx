import React from "react";
import {
  Box, Grid, Paper, Toolbar, Typography, Button, Card, CardActionArea,
  CardMedia, CardContent, CardActions, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton, Snackbar, Alert, CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { useParams } from "react-router-dom";
import api, { APP_URL } from "../../api"; // APP_URL = http://localhost:8000
import pdfPlaceholder from "../../assets/pdf-placeholder.webp";
import videoPlaceholder from "../../assets/video-placeholder.jpg";

export default function Contents() {
  const { courseId } = useParams();

  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isEdit, setIsEdit] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const [form, setForm] = React.useState({ title: "", file: null });

  const [viewerOpen, setViewerOpen] = React.useState(false);
  const [viewItem, setViewItem] = React.useState(null);

  const [toast, setToast] = React.useState({ open: false, message: "", severity: "success" });
  const openToast = (m, s = "success") => setToast({ open: true, message: m, severity: s });
  const closeToast = () => setToast((p) => ({ ...p, open: false }));

  const [me, setMe] = React.useState(null);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/courses/content/${courseId}`);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      openToast("Failed to load contents", "error");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchContents();
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
  }, [courseId]);

  const openCreate = () => {
    setIsEdit(false);
    setEditingId(null);
    setForm({ title: "", file: null });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setIsEdit(true);
    setEditingId(item.id);
    setForm({ title: item.title, file: null });
    setDialogOpen(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      if (form.file) fd.append("file", form.file);

      if (isEdit) {
        fd.append("_method", "PUT");
        await api.post(`/update-content/${editingId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        openToast("Content updated");
      } else {
        await api.post(`/add-content/${courseId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        openToast("Content added");
      }
      setDialogOpen(false);
      fetchContents();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || "Operation failed";
      openToast(msg, "error");
    }
  };

  const removeItem = async (id) => {
    if (!confirm("Delete this content?")) return;
    try {
      await api.delete(`/delete-content/${id}`);
      openToast("Content deleted");
      fetchContents();
    } catch {
      openToast("Delete failed", "error");
    }
  };

  const openViewer = (item) => {
    setViewItem(item);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setViewItem(null);
  };

  const pickFile = (e) => setForm((p) => ({ ...p, file: e.target.files?.[0] || null }));

  const urlFrom = (item) =>
    item.content_url || (item.path ? `${APP_URL}/${item.path}` : "");

  const thumbFrom = (item) => {
    if (item.type === "pdf") return pdfPlaceholder;
    if (item.type === "video") return videoPlaceholder;
    return item.thumbnail_url || urlFrom(item);
  };

  const renderThumb = (item) => (
    <CardMedia
      component="img"
      height="160"
      image={thumbFrom(item)}
      alt={item.title}
      sx={{ objectFit: "cover" }}
    />
  );

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Toolbar sx={{ px: 0 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Course Contents
          </Typography>
          {me?.role === "admin" && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            New Content
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
          <Grid container spacing={2}>
            {items.length === 0 && (
              <Grid item xs={12}>
                <Typography align="center">No content yet.</Typography>
              </Grid>
            )}
            {items.map((item) => (
              <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
                <Card>
                  <CardActionArea onClick={() => openViewer(item)}>
                    {renderThumb(item)}
                    <CardContent>
                      <Typography variant="subtitle1" noWrap>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.type}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  {me?.role === "admin" && (
                    <>
                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <IconButton onClick={() => openEdit(item)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => removeItem(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                    </>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{isEdit ? "Edit Content" : "New Content"}</DialogTitle>
        <form onSubmit={submitForm}>
          <DialogContent dividers>
            <TextField
              fullWidth
              label="Title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <Button component="label" variant="outlined">
              {isEdit ? "Change File" : "Upload File"}
              <input
                hidden
                type="file"
                accept="image/*,video/*,application/pdf"
                onChange={pickFile}
              />
            </Button>
            {form.file && (
              <Typography variant="caption" sx={{ ml: 2 }}>
                {form.file.name}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {isEdit ? "Save" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Viewer dialog */}
      <Dialog open={viewerOpen} onClose={closeViewer} fullWidth maxWidth="md">
        <DialogTitle>
          {viewItem?.title}
          <IconButton onClick={closeViewer} sx={{ position: "absolute", right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {viewItem && (
            <>
              {viewItem.type === "image" && (
                <img
                  src={urlFrom(viewItem)}
                  alt={viewItem.title}
                  style={{ width: "100%", height: "auto" }}
                />
              )}
              {viewItem.type === "video" && (
                <video src={urlFrom(viewItem)} controls style={{ width: "100%" }} />
              )}
              {viewItem.type === "pdf" && (
                <iframe title="pdf" src={urlFrom(viewItem)} style={{ width: "100%", height: "75vh", border: 0 }} />
              )}
              {!["image", "video", "pdf"].includes(viewItem.type) && (
                <a href={urlFrom(viewItem)} target="_blank" rel="noreferrer">
                  Open file
                </a>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={closeToast}>
        <Alert onClose={closeToast} severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
