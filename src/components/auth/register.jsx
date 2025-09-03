import React from "react";
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  Avatar,
  MenuItem,
} from "@mui/material";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

function Register() {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    role: "",
    password: "",
    password_confirmation: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/register`, formData);
      window.location.href = "/";
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert("Registration failed. Check console for details.");
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
          <PersonAddAltIcon />
        </Avatar>

        <Typography variant="h5" gutterBottom>
          Register
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            fullWidth
            label="Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            fullWidth
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            fullWidth
            select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="lecture">Lecture</MenuItem>
          </TextField>

          <TextField
            margin="normal"
            fullWidth
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            fullWidth
            label="Confirm Password"
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.2 }}
          >
            Register
          </Button>
        </form>

        <Typography variant="body2">
          Already have an account? <a href="/">Login</a>
        </Typography>
      </Paper>
    </Box>
  );
}

export default Register;
