// src/pages/Login.jsx
import React from "react";
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  Avatar,
  Link,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import axios from "axios";

const API_URL = "http://localhost:8000/api"; // adjust if needed

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({ email: "", password: "" });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/login`, form);
      // store token + user (very simple)
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      // set default auth header for future requests
      axios.defaults.headers.common.Authorization = `Bearer ${res.data.access_token}`;
      // go to dashboard (adjust your route)
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please check credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#1976d2",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Avatar sx={{ bgcolor: "primary.main", mx: "auto", mb: 2 }}>
          <LockOutlinedIcon />
        </Avatar>

        <Typography variant="h5" gutterBottom>
          Sign In
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            fullWidth
            label="Email Address"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.2 }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <Typography variant="body2">
          Don’t have an account?{" "}
          <Link component={RouterLink} to="/register">
            register
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}

export default Login;
