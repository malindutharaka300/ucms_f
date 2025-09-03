import React from "react";
import {
  AppBar, Toolbar, Typography, CssBaseline, Drawer, List,
  ListItemIcon, ListItemText, IconButton, Box, ListItemButton, Button
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import BeenhereIcon from '@mui/icons-material/Beenhere';
import AssignmentAddIcon from '@mui/icons-material/AssignmentAdd';
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import api from "./api";

const drawerWidth = 220;

function Dashboard() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [me, setMe] = React.useState(null);
  const navigate = useNavigate();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  React.useEffect(() => {
    const cached = localStorage.getItem("user");
    if (cached) {
      try { setMe(JSON.parse(cached)); } catch {}
    }
    // Always verify via /user (handles role/changes)
    api.get("/user")
      .then(res => {
        setMe(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      })
      .catch(() => {
        // token invalid/expired
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/", { replace: true });
      });
  }, [navigate]);

  const logout = async () => {
    try { await api.post("/logout"); } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const navItems = [
    { text: "Courses",  icon: <HomeIcon />,   to: "courses" },
    { text: "Result",   icon: <BeenhereIcon />, to: "result" },
    ...(me?.role === "admin"
      ? [{ text: "Assign", icon: <AssignmentAddIcon />, to: "assign" }]
      : [])
  ];

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.text}
            component={NavLink}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#e3f2fd" : "transparent",
              borderRadius: 8,
            })}
          >
            <ListItemIcon sx={{ color: "primary.main" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        sx={{ zIndex: (t) => t.zIndex.drawer + 1, backgroundColor: "primary.main" }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ display: { sm: "none" } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My Dashboard {me ? `— ${me.name} (${me.email})` : ""}
          </Typography>
          <Button onClick={logout} color="inherit" variant="outlined">
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* SIDEBAR */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        {/* Mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* MAIN */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}>
        {/* {me ? `${me.role}` : ""} */}
        <Outlet />
      </Box>
    </Box>
  );
}

export default Dashboard;
